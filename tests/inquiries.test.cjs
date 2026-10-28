const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

// Compile the actual TS module with the project's existing TypeScript dependency,
// keeping the validation tests runnable without adding a test framework.
const sourcePath = path.resolve(__dirname, '../lib/inquiries.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = Module._nodeModulePaths(path.dirname(sourcePath));
loaded._compile(compiled, sourcePath);
const { validateInquiry } = loaded.exports;

const base = {
  name: '  Ada Lovelace  ',
  email: ' ADA@example.com ',
  service: 'flights',
  serviceCategory: 'travel',
  message: 'Please compare options for next month.',
  consent: true,
};

test('validates and normalizes the public form fields', () => {
  const result = validateInquiry(base);
  assert.equal(result.error, undefined);
  assert.equal(result.data.name, 'Ada Lovelace');
  assert.equal(result.data.email, 'ada@example.com');
  assert.equal(result.data.serviceSlug, 'flights');
  assert.deepEqual(result.data.serviceSlugs, ['flights']);
  assert.equal(result.data.serviceCategory, 'travel');
});

test('rejects malformed required fields with actionable errors', () => {
  assert.match(validateInquiry({ ...base, email: 'not-an-email' }).error, /email/i);
  assert.match(validateInquiry({ ...base, serviceCategory: 'unknown' }).error, /category/i);
  assert.match(validateInquiry({ ...base, message: 'short' }).error, /more/i);
  assert.match(validateInquiry({ ...base, name: 'A' }).error, /name/i);
  assert.match(validateInquiry({ ...base, serviceSelections: ['unknown'] }).error, /valid services/i);
});

test('accepts combined service requests and removes duplicates', () => {
  const result = validateInquiry({ ...base, service: 'flights', serviceSelections: ['flights', 'accommodation', 'research'] });
  assert.deepEqual(result.data.serviceSlugs, ['flights', 'accommodation', 'research']);
});

test('silently accepts a filled honeypot without creating inquiry data', () => {
  const result = validateInquiry({ ...base, website: 'https://spam.example' });
  assert.equal(result.data, undefined);
  assert.equal(result.error, undefined);
});

test('preserves allowed flight details and drops untrusted/internal travel keys', () => {
  const result = validateInquiry({
    ...base,
    travelDetails: {
      tripType: 'flight', origin: 'JFK', destination: 'LHR', departureDate: '2027-02-10', tripMode: 'one-way',
      travelers: 2, cabin: 'Business', supplierConfirmationReference: 'should-not-be-public',
      passportNumber: 'should-not-be-stored',
    },
  });
  assert.deepEqual(result.data.travelDetails, {
    tripType: 'flight', origin: 'JFK', destination: 'LHR', departureDate: '2027-02-10', tripMode: 'one-way', travelers: 2, cabin: 'Business',
  });
});

test('validates trip-specific bounds and keeps the request type whitelist', () => {
  const hotel = validateInquiry({ ...base, travelDetails: {
    tripType: 'hotel', destination: 'Lisbon', checkIn: '2027-06-01', checkOut: '2027-06-03', guests: 3, rooms: 2,
    creditCard: 'ignored',
  } });
  assert.equal(hotel.data.travelDetails.guests, 3);
  assert.equal(hotel.error, undefined);
  assert.equal(hotel.data.travelDetails.creditCard, undefined);

  const reservation = validateInquiry({ ...base, travelDetails: {
    tripType: 'reservation', location: 'Soho', partySize: 101, date: '2027-05-05', preference: 'quiet table',
  } });
  assert.equal(reservation.data.travelDetails.partySize, undefined);
  assert.equal(reservation.data.travelDetails.date, '2027-05-05');
  assert.equal(reservation.data.travelDetails.preference, 'quiet table');
});

test('keeps complete-trip destinations and components while excluding sensitive keys', () => {
  const trip = validateInquiry({ ...base, travelDetails: {
    tripType: 'complete-trip', origin: 'New York', destinations: ['London', 'Paris'],
    departureDate: '2027-09-01', returnDate: '2027-09-12', components: ['flight', 'hotel'],
    passportNumber: 'ignored',
  } });
  assert.deepEqual(trip.data.travelDetails, {
    tripType: 'complete-trip', origin: 'New York', destinations: ['London', 'Paris'],
    departureDate: '2027-09-01', returnDate: '2027-09-12', components: ['flight', 'hotel'],
  });
});

test('rejects impossible or reversed travel dates on the server', () => {
  const hotel = validateInquiry({ ...base, travelDetails: {
    tripType: 'hotel', destination: 'Lisbon', checkIn: '2027-02-30', checkOut: '2027-03-01',
  } });
  assert.match(hotel.error, /valid travel dates/i);
  const reversed = validateInquiry({ ...base, travelDetails: {
    tripType: 'flight', origin: 'JFK', destination: 'LHR', tripMode: 'return',
    departureDate: '2027-02-12', returnDate: '2027-02-10', passengers: 1,
  } });
  assert.match(reversed.error, /after departure/i);
});
