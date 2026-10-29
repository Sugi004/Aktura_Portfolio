import Image from 'next/image';
import { serviceVisuals } from '@/lib/service-visuals';

export default function ServiceVisualPair({ serviceId }: { serviceId: string }) {
  const visual = serviceVisuals[serviceId];
  if (!visual) return null;

  return <div className="service-visual-pair" role="group" aria-label="Illustrative before and after service workflow">
    <figure className={`service-visual service-visual-before${serviceId === 'executive' ? ' service-visual-before-executive' : ''}`}>
      <div className="service-visual-artwork">
        <Image src={visual.image} alt={visual.alt} width={960} height={640} sizes="(max-width: 760px) 92vw, (max-width: 1100px) 42vw, 360px" />
        <span className="service-visual-index">Before · illustrative</span>
        {serviceId === 'executive' && <div className="executive-before-mockup" aria-label="Fictional example of an overloaded inbox and overlapping meetings">
          <div className="executive-before-heading"><span>INBOX</span><b>8 unread</b></div>
          <div className="executive-before-columns">
            <div><i>Travel options</i><i>Follow-up needed</i><i>Review request</i></div>
            <div className="executive-before-calendar"><strong>CALENDAR</strong><i>9:00 · Meeting</i><i>9:30 · Conflict</i><i>10:00 · Hold</i></div>
          </div>
          <span className="executive-before-note">Fictional inbox and calendar</span>
        </div>
        }
      </div>
      <figcaption>{visual.context}</figcaption>
    </figure>
    <figure className="service-visual service-visual-after">
      <div className="service-visual-artwork">
        <Image src={`/images/services/after-${serviceId}.svg`} alt={`Illustrative ${visual.workflow.toLowerCase()} mockup. Fictional interface, not client work.`} width={960} height={640} sizes="(max-width: 760px) 92vw, (max-width: 1100px) 42vw, 360px" />
        <span className="service-visual-index">After · illustrative</span>
      </div>
      <figcaption>{serviceId === 'executive' ? 'Priority inbox · clear calendar.' : visual.workflow}</figcaption>
    </figure>
    <p className="service-visual-disclaimer">Illustrative examples only; fictional mockups, not client work, activity or outcome claims.</p>
  </div>;
}
