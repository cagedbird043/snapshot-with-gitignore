import styles from './StatusBar.module.css';

interface StatusBarProps {
    status: string;
}

export const StatusBar = ({ status }: StatusBarProps) => (
    <section className={styles.statusPanel}>
        <p aria-live="polite">
            <strong>Status:</strong> {status}
        </p>
    </section>
);
