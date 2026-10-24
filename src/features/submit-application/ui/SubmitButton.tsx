interface SubmitButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function SubmitButton({ disabled, onClick }: SubmitButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-caramel-500 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-caramel-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-caramel-200 disabled:cursor-not-allowed disabled:bg-milk-300 disabled:text-cocoa-400 disabled:shadow-none"
    >
      Оставить заявку
    </button>
  );
}
