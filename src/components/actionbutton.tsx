function ActionButton({
  label,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  variant: "approve" | "reject";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "approve"
          ? "border-accent text-accent hover:bg-accent hover:text-accent-contrast"
          : "border-border text-fg-muted hover:border-fg hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

export default ActionButton;
