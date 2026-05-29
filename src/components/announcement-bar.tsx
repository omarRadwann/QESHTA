import styles from "./announcement-bar.module.css";

// Edit these to change the rolling promo messages.
const MESSAGES = [
  "Free Cash-on-Delivery across Egypt",
  "Complimentary easy returns within 14 days",
  "New Spring '26 collection now live",
];

function Group() {
  return (
    <div className={styles.group}>
      {MESSAGES.map((message, index) => (
        <span key={index} className={styles.item}>
          {message}
          <span className={styles.dot} aria-hidden="true">
            &bull;
          </span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div className={styles.bar} role="region" aria-label="Store announcements">
      <span className={styles.srOnly}>{MESSAGES.join(". ")}.</span>
      <div className={styles.marquee} aria-hidden="true">
        <Group />
        <Group />
      </div>
    </div>
  );
}
