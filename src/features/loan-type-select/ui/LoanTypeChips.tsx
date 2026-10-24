import { LOAN_PRODUCTS, LOAN_TYPE_IDS, type LoanTypeId } from "@/shared/config/loanProducts";

interface LoanTypeChipsProps {
  value: LoanTypeId;
  onChange: (type: LoanTypeId) => void;
}

export function LoanTypeChips({ value, onChange }: LoanTypeChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Тип кредита">
      {LOAN_TYPE_IDS.map((id) => {
        const product = LOAN_PRODUCTS[id];
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected
                ? "border-caramel-500 bg-caramel-500 text-white shadow-soft"
                : "border-milk-300 bg-milk-50 text-cocoa-700 hover:border-caramel-300 hover:bg-white"
            }`}
          >
            {product.title}
            <span
              className={`ml-2 text-xs ${selected ? "text-caramel-100" : "text-cocoa-400"}`}
            >
              {(product.annualRate * 100).toLocaleString("ru-RU")}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
