// tailwind.config.js
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },
                gold: {
                    DEFAULT: 'var(--color-gold)',
                    light: 'var(--color-gold-light)',
                    dark: 'var(--color-gold-dark)',
                    muted: 'var(--color-gold-muted)',
                    subtle: 'var(--color-gold-subtle)',
                },
                text: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                    muted: 'var(--color-text-muted)',
                    inverse: 'var(--color-text-inverse)',
                },
                bg: {
                    primary: 'var(--color-bg-primary)',
                    secondary: 'var(--color-bg-secondary)',
                    card: 'var(--color-bg-card)',
                    input: 'var(--color-bg-input)',
                },
                border: {
                    DEFAULT: 'var(--color-border)',
                    hover: 'var(--color-border-hover)',
                },
            },
        },
    },
};