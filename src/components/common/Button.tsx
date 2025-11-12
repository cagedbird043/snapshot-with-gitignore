import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

type ButtonType = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export const Button = ({
    variant = 'secondary',
    className = '',
    disabled,
    type = 'button',
    ...props
}: PropsWithChildren<ButtonType>) => {
    const classes = [styles.button, variant === 'primary' ? styles.primary : styles.secondary];
    if (disabled) {
        classes.push(styles.disabled);
    }
    if (className) {
        classes.push(className);
    }

    return (
        <button
            {...props}
            type={type}
            className={classes.filter(Boolean).join(' ')}
            disabled={disabled}
        />
    );
};
