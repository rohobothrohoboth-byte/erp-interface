import React from 'react';
import { useParams } from 'react-router-dom';
import EvaluationStepSection from '../../../../components/settings/hrSettings/Recruitment/evaluationStep/EvaluationStepSection';

const PageEvaluationStep: React.FC = () => {
  const { flowId = '' } = useParams<{ flowId: string }>();

  const flowName = flowId;

  return (
    <div >
      <EvaluationStepSection flowId={flowId} flowName={flowName} />
    </div>
  );
};

export default PageEvaluationStep;
