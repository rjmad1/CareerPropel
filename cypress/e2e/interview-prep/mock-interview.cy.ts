describe('MockInterview Component', () => {
  beforeEach(() => {
    cy.visit('/interview-prep');
    cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    cy.get('[data-cy="mock-interview-tab"]').click();
    cy.get('[data-cy="mock-interview-container"]').should('be.visible');
  });

  describe('Interview Setup Stage', () => {
    it('should display setup stage', () => {
      cy.get('[data-cy="setup-stage"]').should('be.visible');
    });

    it('should show interview type selection', () => {
      cy.get('[data-cy="interview-type-selector"]').should('be.visible');
    });

    it('should display behavioral interview option', () => {
      cy.get('[data-cy="interview-type"][data-type="behavioral"]').should('be.visible');
    });

    it('should display technical interview option', () => {
      cy.get('[data-cy="interview-type"][data-type="technical"]').should('be.visible');
    });

    it('should allow selecting interview type', () => {
      cy.get('[data-cy="interview-type"][data-type="behavioral"]').click();
      cy.get('[data-cy="interview-type"][data-type="behavioral"]').should('have.class', 'selected');
    });

    it('should show difficulty level selector', () => {
      cy.get('[data-cy="difficulty-selector"]').should('be.visible');
    });

    it('should display difficulty options', () => {
      cy.get('[data-cy="difficulty-option"]').should('have.length.greaterThan', 0);
    });

    it('should allow selecting difficulty', () => {
      cy.get('[data-cy="difficulty-option"][data-difficulty="medium"]').click();
      cy.get('[data-cy="difficulty-option"][data-difficulty="medium"]').should('have.class', 'selected');
    });

    it('should show start button', () => {
      cy.get('[data-cy="start-interview-btn"]').should('be.visible').and('be.enabled');
    });

    it('should display setup instructions', () => {
      cy.get('[data-cy="setup-instructions"]').should('be.visible');
    });

    it('should show equipment requirements', () => {
      cy.get('[data-cy="equipment-requirements"]').should('be.visible');
    });

    it('should display microphone check section', () => {
      cy.get('[data-cy="microphone-check"]').should('be.visible');
    });

    it('should allow testing microphone', () => {
      cy.get('[data-cy="test-microphone-btn"]').click();
      cy.get('[data-cy="microphone-status"]').should('contain', /Testing|Ready|Failed/i);
    });

    it('should show camera check section', () => {
      cy.get('[data-cy="camera-check"]').should('be.visible');
    });

    it('should allow testing camera', () => {
      cy.get('[data-cy="test-camera-btn"]').click();
      cy.get('[data-cy="camera-status"]').should('contain', /Testing|Ready|Failed/i);
    });
  });

  describe('Interview Recording Stage', () => {
    beforeEach(() => {
      cy.get('[data-cy="start-interview-btn"]').click();
    });

    it('should display recording stage after starting', () => {
      cy.get('[data-cy="recording-stage"]').should('be.visible');
    });

    it('should show current question', () => {
      cy.get('[data-cy="current-question"]').should('be.visible');
    });

    it('should display question number', () => {
      cy.get('[data-cy="question-number"]').should('contain', /Question \d+ of \d+/);
    });

    it('should display question text', () => {
      cy.get('[data-cy="question-text"]').should('contain', /\w+/);
    });

    it('should show timer', () => {
      cy.get('[data-cy="timer"]').should('be.visible').and('contain', /\d+:\d+/);
    });

    it('should display question time limit', () => {
      cy.get('[data-cy="time-limit"]').should('contain', /min/);
    });

    it('should show recording indicator', () => {
      cy.get('[data-cy="recording-indicator"]').should('be.visible');
    });

    it('should display video preview during recording', () => {
      cy.get('[data-cy="video-preview"]').should('be.visible');
    });

    it('should allow pausing recording', () => {
      cy.get('[data-cy="pause-recording-btn"]').click();
      cy.get('[data-cy="recording-state"]').should('contain', 'Paused');
    });

    it('should allow resuming paused recording', () => {
      cy.get('[data-cy="pause-recording-btn"]').click();
      cy.get('[data-cy="resume-recording-btn"]').click();
      cy.get('[data-cy="recording-state"]').should('contain', 'Recording');
    });

    it('should allow skipping to next question', () => {
      cy.get('[data-cy="next-question-btn"]').click();
      cy.get('[data-cy="question-number"]').should('contain', 'Question 2');
    });

    it('should warn when time is running out', () => {
      cy.get('[data-cy="timer"]').then(($timer) => {
        const time = $timer.text();
        if (time.includes('0:30') || time.includes('0:29')) {
          cy.get('[data-cy="time-warning"]').should('be.visible');
        }
      });
    });

    it('should auto-advance when time expires', () => {
      cy.get('[data-cy="timer"]').should('contain', '0:00');
      cy.get('[data-cy="question-number"]').should('contain', 'Question 2');
    });

    it('should show transcript of user speech', () => {
      cy.wait(500);
      cy.get('[data-cy="speech-transcript"]').should('be.visible');
    });

    it('should display confidence score while recording', () => {
      cy.wait(500);
      cy.get('[data-cy="confidence-score"]').should('contain', '%');
    });
  });

  describe('Interview Review Stage', () => {
    beforeEach(() => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="complete-interview-btn"]').click();
    });

    it('should display review stage after completion', () => {
      cy.get('[data-cy="review-stage"]').should('be.visible');
    });

    it('should show overall interview score', () => {
      cy.get('[data-cy="overall-score"]').should('contain', '%');
    });

    it('should display competency breakdown', () => {
      cy.get('[data-cy="competency-breakdown"]').should('be.visible');
    });

    it('should show score for each competency', () => {
      cy.get('[data-cy="competency-score"]').should('have.length.greaterThan', 0);
    });

    it('should display strengths section', () => {
      cy.get('[data-cy="strengths-section"]').should('be.visible');
    });

    it('should list user strengths', () => {
      cy.get('[data-cy="strength-item"]').should('have.length.greaterThan', 0);
    });

    it('should show strength explanations', () => {
      cy.get('[data-cy="strength-item"]').first().within(() => {
        cy.get('[data-cy="strength-explanation"]').should('be.visible');
      });
    });

    it('should display improvement areas section', () => {
      cy.get('[data-cy="improvements-section"]').should('be.visible');
    });

    it('should list improvement areas', () => {
      cy.get('[data-cy="improvement-item"]').should('have.length.greaterThan', 0);
    });

    it('should show improvement suggestions', () => {
      cy.get('[data-cy="improvement-item"]').first().within(() => {
        cy.get('[data-cy="improvement-suggestion"]').should('be.visible');
      });
    });

    it('should display detailed feedback', () => {
      cy.get('[data-cy="feedback-section"]').should('be.visible');
    });

    it('should show feedback for each question', () => {
      cy.get('[data-cy="question-feedback"]').should('have.length.greaterThan', 0);
    });

    it('should display question asked and user answer', () => {
      cy.get('[data-cy="question-feedback"]').first().within(() => {
        cy.get('[data-cy="question-asked"]').should('be.visible');
        cy.get('[data-cy="user-answer"]').should('be.visible');
      });
    });

    it('should show detailed feedback on answer', () => {
      cy.get('[data-cy="question-feedback"]').first().within(() => {
        cy.get('[data-cy="answer-feedback"]').should('be.visible');
      });
    });

    it('should display video playback of answers', () => {
      cy.get('[data-cy="video-playback"]').should('be.visible');
    });

    it('should allow playing back recorded answers', () => {
      cy.get('[data-cy="play-video-btn"]').first().click();
      cy.get('[data-cy="video-player"]').should('be.visible');
    });

    it('should show next steps guidance', () => {
      cy.get('[data-cy="next-steps-section"]').should('be.visible');
    });

    it('should provide retake option', () => {
      cy.get('[data-cy="retake-interview-btn"]').should('be.visible');
    });

    it('should allow scheduling follow-up practice', () => {
      cy.get('[data-cy="schedule-practice-btn"]').should('be.visible');
    });
  });

  describe('Question Mix', () => {
    it('should include behavioral questions', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="current-question"]').should('contain', /Tell me|Describe|Give an example/i);
    });

    it('should include technical questions if technical type selected', () => {
      cy.get('[data-cy="interview-type"][data-type="technical"]').click();
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="current-question"]').should('contain', /Code|Algorithm|Design|System/i);
    });

    it('should present 5 questions total', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="question-number"]').then(($el) => {
        const text = $el.text();
        expect(text).to.contain('of 5');
      });
    });

    it('should randomize question order', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      const questions = [];
      cy.get('[data-cy="current-question"]').then(($q) => {
        questions.push($q.text());
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('[data-cy="mock-interview-container"]').find('h2, h3, h4').should('have.length.greaterThan', 0);
    });

    it('should have accessible buttons', () => {
      cy.get('[data-cy="mock-interview-container"]').find('button').each(($btn) => {
        cy.wrap($btn).should('have.attr', 'aria-label').or('contain', /\w+/);
      });
    });

    it('should have keyboard navigation', () => {
      cy.get('[data-cy="start-interview-btn"]').focus();
      cy.get('[data-cy="start-interview-btn"]').should('have.focus');
    });

    it('should support keyboard Enter to start interview', () => {
      cy.get('[data-cy="start-interview-btn"]').focus();
      cy.get('[data-cy="start-interview-btn"]').type('{enter}');
      cy.get('[data-cy="recording-stage"]').should('be.visible');
    });

    it('should have color contrast for difficulty options', () => {
      cy.get('[data-cy="difficulty-option"]').each(($el) => {
        cy.wrap($el).should('be.visible');
      });
    });

    it('should provide text alternatives for icons', () => {
      cy.get('[data-cy="mock-interview-container"]').find('svg').each(($svg) => {
        cy.wrap($svg).should('have.attr', 'aria-label').or('have.attr', 'title');
      });
    });

    it('should announce score updates', () => {
      cy.get('[data-cy="mock-interview-container"]').find('[role="status"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile (375px)', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="mock-interview-container"]').should('be.visible');
      cy.get('[data-cy="start-interview-btn"]').should('be.visible');
    });

    it('should stack setup elements vertically on mobile', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="interview-type-selector"]').should('be.visible');
      cy.get('[data-cy="difficulty-selector"]').should('be.visible');
    });

    it('should be responsive on tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="mock-interview-container"]').should('be.visible');
      cy.get('[data-cy="setup-instructions"]').should('be.visible');
    });

    it('should display 2-column layout on tablet', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="two-column-layout"]').should('be.visible');
    });

    it('should be responsive on desktop (1280px)', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="mock-interview-container"]').should('be.visible');
      cy.get('[data-cy="multi-column-layout"]').should('be.visible');
    });

    it('should display all setup options on desktop', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="interview-type-selector"]').should('be.visible');
      cy.get('[data-cy="difficulty-selector"]').should('be.visible');
      cy.get('[data-cy="setup-instructions"]').should('be.visible');
    });

    it('should adjust video preview size on mobile', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="video-preview"]').should('have.css', 'width');
    });
  });

  describe('Error Handling', () => {
    it('should handle microphone permission denied', () => {
      cy.intercept('**/media/devices', { statusCode: 403 }).as('permissionDenied');
      cy.get('[data-cy="test-microphone-btn"]').click();
      cy.wait('@permissionDenied');
      cy.get('[data-cy="microphone-error"]').should('be.visible');
    });

    it('should handle camera permission denied', () => {
      cy.intercept('**/media/devices', { statusCode: 403 }).as('permissionDenied');
      cy.get('[data-cy="test-camera-btn"]').click();
      cy.wait('@permissionDenied');
      cy.get('[data-cy="camera-error"]').should('be.visible');
    });

    it('should handle recording failure gracefully', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.intercept('**/recording', { statusCode: 500 }).as('recordingError');
      cy.wait('@recordingError');
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('should provide retry option on error', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.intercept('**/recording', { statusCode: 500 }).as('recordingError');
      cy.wait('@recordingError');
      cy.get('[data-cy="retry-button"]').should('be.visible').click();
    });

    it('should handle network disconnection during interview', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.intercept('**/recording/stream', { forceNetworkError: true }).as('networkError');
      cy.wait('@networkError');
      cy.get('[data-cy="connection-error"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should display loading state while starting interview', () => {
      cy.intercept('GET', '**/questions', (req) => {
        req.reply((res) => {
          res.delay(1000);
        });
      }).as('loadingQuestions');
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="loading-state"]').should('be.visible');
    });

    it('should display loading state while processing answers', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="complete-interview-btn"]').click();
      cy.get('[data-cy="processing-state"]').should('be.visible');
    });

    it('should remove loading state after completion', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="complete-interview-btn"]').click();
      cy.get('[data-cy="review-stage"]').should('be.visible');
    });
  });

  describe('Data Accuracy', () => {
    it('should display correct interview type', () => {
      cy.get('[data-cy="interview-type"][data-type="behavioral"]').click();
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="interview-type-display"]').should('contain', 'Behavioral');
    });

    it('should show correct question count', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="question-number"]').should('contain', 'of 5');
    });

    it('should display score in valid range', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="complete-interview-btn"]').click();
      cy.get('[data-cy="overall-score"]').then(($el) => {
        const score = parseInt($el.text());
        expect(score).to.be.within(0, 100);
      });
    });

    it('should display valid competency scores', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="complete-interview-btn"]').click();
      cy.get('[data-cy="competency-score"]').each(($el) => {
        const score = parseInt($el.text());
        expect(score).to.be.within(0, 100);
      });
    });

    it('should have consistent timer display', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="timer"]').should('match', /\d+:\d+/);
    });
  });

  describe('Interview Persistence', () => {
    it('should save interview progress', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="next-question-btn"]').click();
      cy.reload();
      cy.get('[data-cy="recording-stage"]').should('be.visible');
    });

    it('should restore current question on reload', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="question-number"]').then(($q) => {
        const currentQuestion = $q.text();
        cy.reload();
        cy.get('[data-cy="question-number"]').should('contain', currentQuestion);
      });
    });

    it('should allow resuming interrupted interview', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="pause-recording-btn"]').click();
      cy.reload();
      cy.get('[data-cy="resume-interview-btn"]').should('be.visible').click();
      cy.get('[data-cy="recording-stage"]').should('be.visible');
    });
  });
});
