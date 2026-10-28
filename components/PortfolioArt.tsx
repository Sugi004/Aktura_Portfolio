import {
  ArrowDownRight,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  MapPin,
  MessageCircle,
  PlaneTakeoff,
  Search,
  ShieldCheck,
} from 'lucide-react';
import GlobeMount from '@/components/GlobeMount';

type Props = { index: number };

const prospects = [
  ['Prospect 01', 'Research source', 'Qualify fit'],
  ['Prospect 02', 'Referral review', 'Confirm contact'],
  ['Prospect 03', 'Market scan', 'Prepare follow-up'],
];

export default function PortfolioArt({ index }: Props) {
  return <div className={`demo-art portfolio-art portfolio-art-${index + 1}`} aria-hidden="true" data-editorial-image>
    {index === 0 && <>
      <GlobeMount label="Illustrative 3D Earth route from New York to London." />
      <div className="portfolio-art-head"><span>TRAVEL COORDINATION</span><span>NEW YORK · LONDON</span></div>
      <div className="portfolio-art-foot"><PlaneTakeoff size={14}/><span>Route · stay · ground transport · meetings</span></div>
    </>}

    {index === 1 && <div className="flight-compare">
      <div className="portfolio-art-head"><span>FLIGHT COMPARISON</span><span>ILLUSTRATIVE</span></div>
      <div className="flight-compare-labels"><span>OPTION</span><span>ROUTE</span><span>TRAVEL TIME</span><span>FARE TERMS</span></div>
      {[
        ['01', 'Nonstop', 'Preferred', 'Flexible'],
        ['02', 'One connection', 'Compare', 'Standard'],
        ['03', 'Alternate time', 'Review', 'Flexible'],
      ].map((row) => <div className="flight-compare-row" key={row[0]}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>)}
      <p><Clock3 size={13}/> Schedule, cabin and change terms reviewed together</p>
    </div>}

    {index === 2 && <div className="stay-shortlist">
      <div className="portfolio-art-head"><span>STAY SHORTLIST</span><span>ILLUSTRATIVE</span></div>
      {[
        ['01', 'Near the meeting area', 'Location · cancellation · transfer'],
        ['02', 'More room to work', 'Workspace · breakfast · check-in'],
        ['03', 'Flexible stay', 'Dates · guest needs · provider terms'],
      ].map((row) => <div className="stay-row" key={row[0]}><span className="stay-number">{row[0]}</span><div><strong>{row[1]}</strong><small>{row[2]}</small></div><MapPin size={14}/></div>)}
      <div className="stay-footer"><span>PRIORITIES</span><i/><i/><i/><span>OPTIONS</span></div>
    </div>}

    {index === 3 && <div className="agenda-visual">
      <div className="portfolio-art-head"><span>WEEK AT A GLANCE</span><span>ILLUSTRATIVE</span></div>
      <div className="agenda-date"><strong>Monday</strong><span>Priorities and preparation</span><CalendarDays size={17}/></div>
      <div className="agenda-track">
        <span>09:00</span><i/><div><strong>Leadership check-in</strong><small>Agenda · notes · follow-ups</small></div>
        <span>11:30</span><i/><div><strong>Focus block</strong><small>Protected working time</small></div>
        <span>15:00</span><i/><div><strong>Weekly review</strong><small>Decisions · next actions</small></div>
      </div>
    </div>}

    {index === 4 && <div className="research-table">
      <div className="portfolio-art-head"><span>LEAD RESEARCH</span><span>ILLUSTRATIVE</span></div>
      <div className="research-columns"><span>PROSPECT</span><span>SOURCE</span><span>NEXT STEP</span></div>
      {prospects.map(([name, source, next]) => <div className="research-row" key={name}><span><i/><strong>{name}</strong></span><span>{source}</span><span>{next}</span></div>)}
      <div className="research-footer"><Search size={13}/><span>Agreed profile · source notes · review before outreach</span></div>
    </div>}

    {index === 5 && <div className="content-calendar">
      <div className="portfolio-art-head"><span>CONTENT RHYTHM</span><span>ILLUSTRATIVE</span></div>
      <div className="content-calendar-month"><strong>Publishing plan</strong><span>4 week view</span></div>
      <div className="content-calendar-weeks">{['W1', 'W2', 'W3', 'W4'].map((week, i) => <div className="content-week" key={week}><span>{week}</span><i className={`content-marker marker-${i + 1}`}/><small>{['Draft', 'Review', 'Approved', 'Scheduled'][i]}</small></div>)}</div>
      <div className="content-calendar-footer"><MessageCircle size={14}/><span>Ideas · review · approved publishing</span></div>
    </div>}

    {index === 6 && <div className="workflow-board">
      <div className="portfolio-art-head"><span>OPERATIONS REVIEW</span><span>ILLUSTRATIVE</span></div>
      <div className="workflow-columns">
        <div><span>UP NEXT</span><article><CalendarCheck size={14}/><strong>Confirm priorities</strong><small>Owner · due date</small></article><article><FileText size={14}/><strong>Prepare weekly brief</strong><small>Inputs · review</small></article></div>
        <div><span>IN PROGRESS</span><article><MessageCircle size={14}/><strong>Client follow-up</strong><small>Draft · approval</small></article><article><ShieldCheck size={14}/><strong>Reconcile records</strong><small>Organize · verify</small></article></div>
      </div>
    </div>}

    {index === 7 && <div className="research-brief">
      <div className="portfolio-art-head"><span>RESEARCH BRIEF</span><span>ILLUSTRATIVE</span></div>
      <div className="brief-title"><span>DECISION NOTE · 01</span><strong>What needs comparing?</strong></div>
      <div className="brief-evidence"><span><i/>Requirements</span><span><i/>Source notes</span><span><i/>Options and trade-offs</span></div>
      <div className="brief-conclusion"><Check size={14}/><span>Summary ready for review</span></div>
    </div>}

    {index === 8 && <div className="reminder-flow">
      <div className="portfolio-art-head"><span>FOLLOW-THROUGH</span><span>ILLUSTRATIVE</span></div>
      <div className="reminder-steps">
        <div><span>01</span><strong>Agree the action</strong><small>Owner · due date</small></div><i/><div><span>02</span><strong>Prepare reminder</strong><small>Review before sending</small></div><i/><div><span>03</span><strong>Close the loop</strong><small>Update the record</small></div>
      </div>
      <div className="reminder-footer"><ShieldCheck size={14}/><span>Human review remains part of the workflow</span><ArrowDownRight size={14}/></div>
    </div>}

    <span className="demo-index">{String(index + 1).padStart(2, '0')}</span>
  </div>;
}
