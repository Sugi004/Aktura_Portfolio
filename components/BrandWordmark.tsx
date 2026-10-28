import Image from 'next/image';
import Link from 'next/link';

type Props = {
  href?: string;
  className?: string;
};

export default function BrandWordmark({ href = '/', className = '' }: Props) {
  return (
    <Link className={`wordmark altura-wordmark ${className}`.trim()} href={href}>
      <Image
        src="/images/altura-mark.webp"
        alt=""
        aria-hidden="true"
        width={44}
        height={36}
        className="altura-wordmark-mark"
        priority
      />
      <span>Altura <span className="altura-wordmark-light">Executive</span></span>
    </Link>
  );
}
