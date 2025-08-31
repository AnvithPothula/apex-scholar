// Test JSX structure
const testStructure = () => {
  return (
    <div>
      <Card>
        <div className="mb-6">
          <div className="flex">
            <div className="flex-1">
              {/* Question content */}
              {currentQuestion?.parts && currentQuestion.parts.length > 0 && (
                <div>
                  <h4>Question Parts:</h4>
                  <div>
                    {currentQuestion.parts.map((part, index) => (
                      <div key={index}>
                        <span>{String.fromCharCode(97 + index)}.)</span>
                        <span>{part}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer Interface */}
        <div className="mt-8">
          {/* MCQ Options */}
          {currentQuestion?.type === 'mcq' && currentQuestion?.options && (
            <div>
              <h3>Choose the best answer:</h3>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
