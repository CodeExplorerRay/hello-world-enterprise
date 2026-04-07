import Link from 'next/link';
import styles from './page.module.css';

export default function NotFound() {
  return (
    <main className={styles.loadingPage}>
      <section className={styles.loadingPanel}>
        <p className={styles.loadingEyebrow}>404</p>
        <h1 className={styles.loadingTitle}>This route missed the service mesh</h1>
        <p className={styles.loadingLead}>The requested page could not be routed.</p>
        <p className={styles.loadingFootnote}>
          The workspace only exposes pages that have been formally approved by the
          greeting council.
        </p>
        <p>
          <Link className={styles.heroStampValue} href='/'>
            Return to the greeting workspace
          </Link>
        </p>
      </section>
    </main>
  );
}
