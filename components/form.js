import { Form } from "react-bootstrap";

const FormField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  as,
  children,
  className,
  disabled,
  autoFocus,
  ref,
}) => {
  return (
    <Form.Group className={`mb-2 ${className || ""}`}>
      <Form.Label className="text-gray-600">{label}</Form.Label>
      <Form.Control
        as={as}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        ref={ref}
        className="rounded border border-gray-200 text-black"
      >
        {children}
      </Form.Control>
    </Form.Group>
  );
};

export default FormField;
