export default function DebugEnvPage() {
  const cozeToken = process.env.COZE_PERSONAL_TOKEN;
  const workflowId = process.env.NEXT_PUBLIC_COZE_WORKFLOW_ID;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>COZE_PERSONAL_TOKEN:</strong>
          <p className="font-mono bg-gray-100 p-2 rounded">
            {cozeToken ? `${cozeToken.substring(0, 10)}...` : "NOT FOUND"}
          </p>
        </div>
        <div>
          <strong>NEXT_PUBLIC_COZE_WORKFLOW_ID:</strong>
          <p className="font-mono bg-gray-100 p-2 rounded">
            {workflowId ?? "NOT FOUND"}
          </p>
        </div>
      </div>
    </div>
  );
}
