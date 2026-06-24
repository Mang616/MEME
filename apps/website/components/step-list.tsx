export function StepList({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="step-list stack-gap-lg">
      {steps.map((step) => (
        <li key={step}>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
