export default function Button({
    children,
    onClick,
    type = 'button',
    style: extraStyle = {},
    disabled,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: '12px 24px',
                fontSize: '1rem',
                borderRadius: 6,
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                color: '#fff', // text color
                backgroundColor: '#2575fc', // default background
                ...extraStyle,
            }}
        >
            {children}
        </button>
    );
}
