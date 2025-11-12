import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    description: string;
}

export const Header = ({ title, description }: HeaderProps) => (
    <header className={styles.header}>
        <h1>{title}</h1>
        <p>{description}</p>
    </header>
);
