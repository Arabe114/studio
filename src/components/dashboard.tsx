export default function Dashboard() {
  return (
    <div className="flex h-full min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          ELN
        </h1>
        <p className="mt-4 text-2xl font-medium text-foreground">
          Electronic Lab Notebook
        </p>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Welcome to your new unified workspace. Seamlessly switch between your knowledge graph, task board, and notes to supercharge your productivity.
        </p>
      </div>
    </div>
  );
}
