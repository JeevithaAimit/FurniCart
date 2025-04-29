import React, { useState } from 'react';
import './FAQ.css';
import HeroSection from "../components/herosection";

const faqData = [
  { question: 'What is your return policy?', answer: 'Currently, we do not offer a return policy. Please ensure your selection is final before purchasing.' },
  { question: 'How long does shipping take?', answer: 'Standard shipping typically takes 5-7 business days. Expedited shipping options are available at checkout.' },
  { question: 'Do you offer international shipping?', answer: 'Currently, we only ship within the country. We are working on expanding our shipping options.' },
  { question: 'How can I track my order?', answer: 'Once your order is shipped, you will receive an email with a tracking number.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, and digital payment methods.' }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="page-container">
      <HeroSection />
      <section className="content-section">
        <h1>Frequently Asked Questions</h1>
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item">
            <button className="faq-question" onClick={() => toggleAnswer(index)}>
              {faq.question}
            </button>
            {activeIndex === index && <p className="faq-answer">{faq.answer}</p>}
          </div>
        ))}
      </section>
    </div>
  );
};

export default FAQ;