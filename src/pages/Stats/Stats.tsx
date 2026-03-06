import { StudyHistory } from '../../components/StudyHistory/StudyHistory';
import styles from './Stats.module.css';

export function Stats() {
  return (
    <div className={styles.statsPage}>
      <StudyHistory />
    </div>
  );
}
