import { useMemo, useState } from "react";
import { LoanTypeChips } from "@/features/loan-type-select/ui/LoanTypeChips";
import { AmountSlider } from "@/features/loan-amount/ui/AmountSlider";
import { TermSlider } from "@/features/loan-term/ui/TermSlider";
import { SubmitButton } from "@/features/submit-application/ui/SubmitButton";
import { useLoanCalculatorPush } from "@/features/loan-application/model/useLoanCalculatorPush";
import { loanApplicationSchema, type LoanApplication } from "@/entities/applicant";
import { calculateLoan, isIncomeSufficient } from "@/entities/loan";
import { LOAN_PRODUCTS, type LoanTypeId } from "@/shared/config/loanProducts";
import { formatCurrency, formatNumber, parseFormattedNumber } from "@/shared/lib/format";

interface FormDraft {
  loanType: LoanTypeId;
  amount: number;
  termMonths: number;
  fullName: string;
  monthlyIncome: number;
  hasCitizenship: boolean;
  consentGiven: boolean;
}

const INITIAL_DRAFT: FormDraft = {
  loanType: "mortgage",
  amount: 5_000_000,
  termMonths: 120,
  fullName: "",
  monthlyIncome: 0,
  hasCitizenship: false,
  consentGiven: false,
};

const FIELD_CLASSES =
  "w-full rounded-xl border border-milk-300 bg-milk-50/70 px-4 py-2.5 text-cocoa-900 placeholder:text-cocoa-400 transition focus:border-caramel-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-caramel-100";

const LABEL_CLASSES = "mb-1.5 block text-sm font-medium text-cocoa-700";

export function LoanCalculator() {
  const [draft, setDraft] = useState<FormDraft>(INITIAL_DRAFT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const product = LOAN_PRODUCTS[draft.loanType];

  const result = useMemo(
    () =>
      calculateLoan({
        loanType: draft.loanType,
        amount: clamp(draft.amount, product.minAmount, product.maxAmount),
        termMonths: clamp(draft.termMonths, product.minTermMonths, product.maxTermMonths),
        annualRate: product.annualRate,
      }),
    [draft.loanType, draft.amount, draft.termMonths, product],
  );

  const validation = loanApplicationSchema.safeParse(draft);
  const isValid = validation.success;

  const errors = useMemo(() => {
    const map: Partial<Record<keyof LoanApplication, string>> = {};
    if (validation.success) return map;
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof LoanApplication;
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }, [validation]);

  const showError = (field: keyof LoanApplication) =>
    touched[field] ? errors[field] : undefined;

  const incomeSufficient = isIncomeSufficient(draft.monthlyIncome, result.monthlyPayment);

  const setField = <K extends keyof FormDraft>(field: K, value: FormDraft[K]) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const { push, status: pushStatus, error: pushError, reset: resetPush } = useLoanCalculatorPush();

  const handleSubmit = () => {
    if (!isValid || pushStatus === "submitting") return;
    const app = validation.success ? validation.data : null;
    if (!app) return;
    void push(app);
  };

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <form
        className="space-y-7 rounded-3xl border border-milk-200 bg-white/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div>
          <label htmlFor="fullName" className={LABEL_CLASSES}>
            ФИО
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={draft.fullName}
            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Иванов Иван Иванович"
            className={FIELD_CLASSES}
          />
          {showError("fullName") && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.fullName}</p>
          )}
        </div>

        <AmountSlider
          value={draft.amount}
          min={product.minAmount}
          max={product.maxAmount}
          error={showError("amount")}
          onChange={(amount) => {
            setTouched((t) => ({ ...t, amount: true }));
            setField("amount", amount);
          }}
        />

        <TermSlider
          value={draft.termMonths}
          min={product.minTermMonths}
          max={product.maxTermMonths}
          error={showError("termMonths")}
          onChange={(termMonths) => {
            setTouched((t) => ({ ...t, termMonths: true }));
            setField("termMonths", termMonths);
          }}
        />

        <div>
          <h2 className={LABEL_CLASSES}>Тип кредита</h2>
          <LoanTypeChips
            value={draft.loanType}
            onChange={(loanType) => {
              const p = LOAN_PRODUCTS[loanType];
              setDraft((prev) => ({
                ...prev,
                loanType,
                amount: clamp(prev.amount, p.minAmount, p.maxAmount),
                termMonths: clamp(prev.termMonths, p.minTermMonths, p.maxTermMonths),
              }));
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="income" className={LABEL_CLASSES}>
              Ежемесячный доход, ₽
            </label>
            <input
              id="income"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={draft.monthlyIncome === 0 ? "" : formatNumber(draft.monthlyIncome)}
              onBlur={() => setTouched((t) => ({ ...t, monthlyIncome: true }))}
              onChange={(e) => {
                const parsed = parseFormattedNumber(e.target.value);
                setField("monthlyIncome", Number.isNaN(parsed) ? 0 : parsed);
              }}
              placeholder="100 000"
              className={`${FIELD_CLASSES} text-right`}
            />
            {showError("monthlyIncome") && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.monthlyIncome}</p>
            )}
            {touched.monthlyIncome && draft.monthlyIncome > 0 && !incomeSufficient && (
              <p className="mt-1.5 text-xs text-amber-700">
                Доход недостаточен: нужно не менее {formatCurrency(result.requiredIncome)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-milk-200 bg-milk-50/80 p-4 sm:p-5">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-cocoa-700">
            <input
              type="checkbox"
              checked={draft.hasCitizenship}
              onChange={(e) => setField("hasCitizenship", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-milk-400 accent-caramel-600"
            />
            <span>
              Я являюсь гражданином РФ
              {showError("hasCitizenship") && (
                <span className="block text-xs text-rose-600">{errors.hasCitizenship}</span>
              )}
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-relaxed text-cocoa-700">
            <input
              type="checkbox"
              checked={draft.consentGiven}
              onChange={(e) => setField("consentGiven", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-milk-400 accent-caramel-600"
            />
            <span>
              Я даю согласие на обработку персональных данных в соответствии с{" "}
              <a
                href="/privacy-policy.pdf"
                className="font-medium text-caramel-700 underline decoration-caramel-300 underline-offset-2 transition hover:text-caramel-800 hover:decoration-caramel-500"
                target="_blank"
                rel="noreferrer noopener"
              >
                политикой конфиденциальности
              </a>{" "}
              (152-ФЗ)
              {showError("consentGiven") && (
                <span className="block text-xs text-rose-600">{errors.consentGiven}</span>
              )}
            </span>
          </label>
        </div>
      </form>

      <aside className="h-fit space-y-5 rounded-3xl border border-milk-200 bg-white/70 p-6 shadow-card backdrop-blur-sm sm:p-7 lg:sticky lg:top-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-cocoa-500">
            Расчёт по продукту
            <span className="mt-1 block text-sm font-semibold normal-case tracking-normal text-cocoa-800">
              {product.title}
            </span>
          </h2>
          <span className="shrink-0 rounded-full border border-caramel-200 bg-white/70 px-3 py-1 text-xs font-semibold text-caramel-700">
            {(product.annualRate * 100).toLocaleString("ru-RU")}%
          </span>
        </div>

        <div className="rounded-2xl border border-caramel-200 bg-caramel-50 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-caramel-700">
            Ежемесячный платёж
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-cocoa-900" data-testid="monthly-payment">
            {formatCurrency(result.monthlyPayment)}
          </p>
        </div>

        <dl className="divide-y divide-milk-200 text-sm">
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-cocoa-500">Количество платежей</dt>
            <dd className="font-semibold text-cocoa-900">{formatNumber(result.paymentsCount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-cocoa-500">Ставка</dt>
            <dd className="font-semibold text-cocoa-900">
              {(product.annualRate * 100).toLocaleString("ru-RU")}%
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-cocoa-500">Требуемая зарплата</dt>
            <dd className="font-semibold text-cocoa-900" data-testid="required-income">
              от {formatCurrency(result.requiredIncome)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-cocoa-500">Общая сумма выплат</dt>
            <dd className="font-semibold text-cocoa-900">{formatCurrency(result.totalRepaid)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-cocoa-500">Переплата</dt>
            <dd className="font-semibold text-cocoa-900">{formatCurrency(result.totalInterest)}</dd>
          </div>
        </dl>

        <SubmitButton
          disabled={!isValid || pushStatus === "submitting"}
          onClick={handleSubmit}
        />
        {!isValid && (
          <p className="text-center text-xs leading-relaxed text-cocoa-500">
            Заполните все поля и подтвердите согласия, чтобы отправить заявку
          </p>
        )}
        {pushStatus === "submitting" && (
          <p className="text-center text-xs text-cocoa-500" data-testid="push-status">
            Отправляем заявку…
          </p>
        )}
        {pushStatus === "success" && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm leading-relaxed text-emerald-800"
            data-testid="push-status"
          >
            Заявка на «{product.title}» принята. Мы свяжемся с вами после рассмотрения.
          </div>
        )}
        {pushStatus === "error" && (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm leading-relaxed text-rose-800"
            data-testid="push-status"
          >
            {pushError}
            <button
              type="button"
              onClick={resetPush}
              className="ml-2 font-medium underline decoration-rose-300 underline-offset-2 hover:text-rose-900"
            >
              Повторить
            </button>
          </div>
        )}
      </aside>
    </section>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
