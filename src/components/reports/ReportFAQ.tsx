import React from 'react';

interface ReportFAQProps {
    heading: string;
    report: any; // Using any for flexible API data access
}

const ReportFAQ: React.FC<ReportFAQProps> = ({ heading, report }) => {
    // Extract Q&A pairs 1 to 6
    const faqs = [];
    for (let i = 1; i <= 6; i++) {
        const question = report[`question_${i}`];
        const answer = report[`answer_${i}`];

        if (question && answer) {
            faqs.push({ question, answer });
        }
    }

    if (faqs.length === 0) return null;

    return (
        <div className="mb-12 font-space-grotesk">
            <h2
                className="font-bold text-black mb-6"
                style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '32px',
                    lineHeight: '40.83px'
                }}
            >
                {heading || 'Frequently Asked Questions'}
            </h2>

            <div className="space-y-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <h3
                            className="font-bold text-"
                            style={{
                                fontFamily: 'Space Grotesk, sans-serif',
                                fontSize: '20px', // "main data have size 20"
                                color: '#464646',
                                fontWeight: 'bold'
                            }}
                        >
                            Q{index + 1}: {faq.question}
                        </h3>
                        <p
                            className="text-gray-700"
                            style={{
                                fontFamily: 'Space Grotesk, sans-serif',
                                fontSize: '20px',
                                lineHeight: '1.6',
                                color: '#464646',
                                fontWeight: 'normal'
                            }}
                            dangerouslySetInnerHTML={{ __html: faq.answer.startsWith('A:') ? faq.answer : `A${index + 1}: ${faq.answer}` }}
                        />
                        {/* Note: The screenshot shows "A1: ...". If API provides raw text, we might want to prepend "A: " or similar if not present.
                             The API example shows "answer_1": "Provident et irure". It doesn't have "A1:".
                             So I will prepend the label for clarity matching the design style "Q1: ... A1: ...".
                             Actually, let's just use "A: " or "A{index+1}: "
                         */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportFAQ;
