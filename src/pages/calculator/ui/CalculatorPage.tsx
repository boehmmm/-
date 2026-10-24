import { LoanCalculator } from "@/widgets/loan-calculator/ui/LoanCalculator";

export function CalculatorPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-milk-300 bg-milk-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-caramel-700">
          <span className="h-1.5 w-1.5 rounded-full bg-caramel-400" aria-hidden="true" />
          Онлайн-расчёт
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-cocoa-900 sm:text-4xl">
          Кредитный калькулятор
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-cocoa-600 sm:text-base">
          Подберите сумму и срок — мы сразу покажем ежемесячный платёж, переплату и требуемый доход.
        </p>
      </header>

      <LoanCalculator />

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-cocoa-500">
        Расчёт носит информационный характер и не является публичной офертой. Итоговые условия
        определяются банком после рассмотрения заявки.
      </p>
    </main>
  );
}
