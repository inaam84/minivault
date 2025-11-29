export default function Input({
    id,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    style: extraStyle = {},
}) {
    return (
        <input
            id={id || name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%',
                padding: 8,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: '1rem',
                color: '#000', // <-- text color inside input
                backgroundColor: '#fff', // <-- solid background
                ...extraStyle,
            }}
        />
    );
}
