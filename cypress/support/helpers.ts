/**
 * Cypress Test Helpers & Utilities
 * Reusable functions for common testing operations
 */

/**
 * Logs in a test user with predefined credentials
 * Assumes login endpoint at /api/auth/login
 */
export function loginUser(email: string = 'test@example.com', password: string = 'password123') {
  cy.visit('/login');
  cy.get('[data-testid="login-email-input"]').type(email);
  cy.get('[data-testid="login-password-input"]').type(password);
  cy.get('[data-testid="login-submit-btn"]').click();
  cy.url().should('include', '/');
  cy.get('[data-testid="job-card"]').should('exist');
}

/**
 * Creates a test job via API
 * Used to ensure consistent test data
 */
export function createTestJob(jobData = {}) {
  const defaultJob = {
    title: 'Software Engineer',
    company: 'Test Company',
    description: 'Test job description',
    location: 'Remote',
    jobType: 'Full-time',
    salary: 150000,
    recruiter: {
      name: 'John Recruiter',
      email: 'recruiter@company.com',
      phone: '555-1234'
    },
    ...jobData
  };

  return cy.request({
    method: 'POST',
    url: '/api/jobs',
    headers: {
      'Content-Type': 'application/json'
    },
    body: defaultJob
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
}

/**
 * Deletes all test data created during the test
 * Called in afterEach hook to clean up
 */
export function deleteTestData() {
  // Delete all test jobs
  cy.request({
    method: 'GET',
    url: '/api/jobs?limit=1000'
  }).then((response) => {
    const jobs = response.body;
    jobs.forEach((job: any) => {
      cy.request({
        method: 'DELETE',
        url: `/api/jobs/${job.id}`
      });
    });
  });

  // Delete all test interviews
  cy.request({
    method: 'GET',
    url: '/api/interviews?limit=1000'
  }).then((response) => {
    const interviews = response.body;
    interviews.forEach((interview: any) => {
      cy.request({
        method: 'DELETE',
        url: `/api/interviews/${interview.id}`
      });
    });
  });

  // Delete all test offers
  cy.request({
    method: 'GET',
    url: '/api/offers?limit=1000'
  }).then((response) => {
    const offers = response.body;
    offers.forEach((offer: any) => {
      cy.request({
        method: 'DELETE',
        url: `/api/offers/${offer.id}`
      });
    });
  });
}

/**
 * Fills multiple form fields efficiently
 * @param fields Object with data-testid as key and value to fill
 */
export function fillForm(fields: Record<string, string>) {
  Object.entries(fields).forEach(([selector, value]) => {
    cy.get(selector).type(value);
  });
}

/**
 * Selects a value from a dropdown
 * @param selector data-testid of the select element
 * @param value Value to select
 */
export function selectDropdown(selector: string, value: string) {
  cy.get(selector).select(value);
}

/**
 * Fills out the interview scheduling form
 * @param type Interview type (phone_screen, technical, etc.)
 * @param date Interview date (YYYY-MM-DD)
 * @param time Interview time (HH:MM)
 * @param interviewer Optional interviewer name
 * @param location Optional location or meeting link
 */
export function scheduleInterview(
  type: string,
  date: string,
  time: string,
  interviewer?: string,
  location?: string
) {
  cy.get('[data-testid="schedule-interview-btn"]').click();
  selectDropdown('[data-testid="interview-type-select"]', type);
  cy.get('[data-testid="interview-date"]').type(date);
  cy.get('[data-testid="interview-time"]').type(time);
  
  if (interviewer) {
    cy.get('[data-testid="interview-interviewer"]').type(interviewer);
  }
  
  if (location) {
    cy.get('[data-testid="interview-location"]').type(location);
  }
  
  cy.get('[data-testid="schedule-submit-btn"]').click();
}

/**
 * Logs an offer via the offers form
 * @param salary Base salary
 * @param bonus Bonus percentage
 * @param equity Equity percentage
 * @param startDate Start date (YYYY-MM-DD)
 * @param notes Optional notes
 */
export function logOffer(
  salary: string,
  bonus: string,
  equity: string,
  startDate: string,
  notes?: string
) {
  cy.get('[data-testid="log-offer-btn"]').click();
  cy.get('[data-testid="offer-salary"]').type(salary);
  cy.get('[data-testid="offer-bonus"]').type(bonus);
  cy.get('[data-testid="offer-equity"]').type(equity);
  cy.get('[data-testid="offer-start-date"]').type(startDate);
  
  if (notes) {
    cy.get('[data-testid="offer-notes"]').type(notes);
  }
  
  cy.get('[data-testid="offer-submit-btn"]').click();
}

/**
 * Opens a job detail panel for the first job
 */
export function openJobDetailPanel() {
  cy.get('[data-testid="job-card"]').first().click();
  cy.get('[data-testid="job-detail-panel"]').should('be.visible');
}

/**
 * Closes the job detail panel
 */
export function closeJobDetailPanel() {
  cy.get('[data-testid="panel-close-btn"]').click();
  cy.get('[data-testid="job-detail-panel"]').should('not.exist');
}

/**
 * Navigates to a specific tab in the detail panel
 * @param tabName Tab name (overview, timeline, interviews, prep, offers)
 */
export function navigateToTab(tabName: 'overview' | 'timeline' | 'interviews' | 'prep' | 'offers') {
  cy.get(`[data-testid="tab-${tabName}"]`).click();
  cy.get(`[data-testid="tab-content-${tabName}"]`).should('be.visible');
}

/**
 * Verifies a loading state is shown and then disappears
 * @param selector Element to wait for (usually a button)
 * @param expectedText Text shown during loading
 */
export function verifyLoadingState(selector: string, expectedText: string = '...') {
  cy.get(selector).should('contain', expectedText);
  cy.get(selector).should('be.disabled');
  cy.get(selector, { timeout: 5000 }).should('not.contain', expectedText);
}

/**
 * Mocks an API error response
 * @param method HTTP method
 * @param url URL pattern to intercept
 * @param statusCode HTTP status code
 * @param errorMessage Error message body
 */
export function mockApiError(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  statusCode: number,
  errorMessage: string
) {
  cy.intercept(method, url, {
    statusCode,
    body: { error: errorMessage }
  });
}

/**
 * Mocks an API success response
 * @param method HTTP method
 * @param url URL pattern to intercept
 * @param responseBody Response body to return
 */
export function mockApiSuccess(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  responseBody: any
) {
  cy.intercept(method, url, {
    statusCode: 200,
    body: responseBody
  });
}

/**
 * Mocks a slow API response
 * @param method HTTP method
 * @param url URL pattern to intercept
 * @param delayMs Delay in milliseconds
 * @param responseBody Optional response body
 */
export function mockSlowApiResponse(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  delayMs: number = 1000,
  responseBody: any = {}
) {
  cy.intercept(method, url, (req) => {
    req.reply((res) => {
      res.delay(delayMs);
      res.send({ statusCode: 200, body: responseBody });
    });
  });
}

/**
 * Waits for a specific API call to complete
 * @param method HTTP method
 * @param url URL pattern to wait for
 */
export function waitForApiCall(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string) {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
}

/**
 * Verifies a confirmation dialog was shown and handles it
 * @param shouldConfirm Whether to confirm (true) or cancel (false)
 */
export function handleConfirmationDialog(shouldConfirm: boolean = true) {
  cy.on('window:confirm', () => shouldConfirm);
}

/**
 * Gets the computed style of an element
 * @param selector data-testid selector
 * @param property CSS property name
 */
export function getElementStyle(selector: string, property: string) {
  return cy.get(selector).should((element) => {
    const style = window.getComputedStyle(element[0]);
    return style.getPropertyValue(property);
  });
}

/**
 * Checks if an element has a specific CSS class
 * @param selector data-testid selector
 * @param className Class name to check
 */
export function hasClass(selector: string, className: string) {
  cy.get(selector).should('have.class', className);
}

/**
 * Checks if an element does NOT have a specific CSS class
 * @param selector data-testid selector
 * @param className Class name to check
 */
export function doesNotHaveClass(selector: string, className: string) {
  cy.get(selector).should('not.have.class', className);
}

/**
 * Verifies error message is displayed
 * @param expectedError Expected error text
 */
export function verifyErrorMessage(expectedError: string) {
  cy.get('[data-testid="error-message"]').should('be.visible');
  cy.get('[data-testid="error-message"]').should('contain', expectedError);
}

/**
 * Verifies success message is displayed
 * @param expectedSuccess Expected success text
 */
export function verifySuccessMessage(expectedSuccess: string) {
  cy.get('[data-testid="success-message"]').should('be.visible');
  cy.get('[data-testid="success-message"]').should('contain', expectedSuccess);
}

/**
 * Clears and fills an input field
 * @param selector data-testid selector
 * @param value Value to enter
 */
export function clearAndFill(selector: string, value: string) {
  cy.get(selector).clear().type(value);
}

/**
 * Gets the text content of an element
 * @param selector data-testid selector
 */
export function getText(selector: string) {
  return cy.get(selector).invoke('text');
}

/**
 * Scrolls an element into view
 * @param selector data-testid selector
 */
export function scrollIntoView(selector: string) {
  cy.get(selector).scrollIntoView();
}

/**
 * Waits for an element to be visible
 * @param selector data-testid selector
 * @param timeout Optional timeout in ms
 */
export function waitForElement(selector: string, timeout: number = 5000) {
  cy.get(selector, { timeout }).should('be.visible');
}

/**
 * Waits for an element to NOT be visible
 * @param selector data-testid selector
 * @param timeout Optional timeout in ms
 */
export function waitForElementToDisappear(selector: string, timeout: number = 5000) {
  cy.get(selector, { timeout }).should('not.exist');
}

/**
 * Verifies element count matches expected
 * @param selector data-testid selector
 * @param count Expected count
 */
export function verifyElementCount(selector: string, count: number) {
  cy.get(selector).should('have.length', count);
}

/**
 * Verifies element count is at least the given value
 * @param selector data-testid selector
 * @param minCount Minimum count
 */
export function verifyElementCountAtLeast(selector: string, minCount: number) {
  cy.get(selector).should('have.length.at.least', minCount);
}

/**
 * Takes a screenshot for visual comparison
 * @param filename Filename for the screenshot
 */
export function takeScreenshot(filename: string) {
  cy.screenshot(filename);
}

/**
 * Enables slow motion for debugging (slows down all commands)
 * @param delayMs Delay in milliseconds
 */
export function enableSlowMotion(delayMs: number = 500) {
  cy.config('defaultCommandTimeout', 1000 + delayMs);
}

/**
 * Creates a test job and opens its detail panel
 */
export function createAndOpenJob(jobData = {}) {
  return createTestJob(jobData).then((job) => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="job-detail-panel"]').should('be.visible');
    return job;
  });
}

/**
 * Compares two numbers with a tolerance
 * @param actual Actual value
 * @param expected Expected value
 * @param tolerance Tolerance percentage (default 5%)
 */
export function assertNumberWithTolerance(
  actual: number,
  expected: number,
  tolerance: number = 5
) {
  const min = expected * (1 - tolerance / 100);
  const max = expected * (1 + tolerance / 100);
  expect(actual).to.be.at.least(min);
  expect(actual).to.be.at.most(max);
}

/**
 * Formats a number as currency for comparison
 * @param amount Amount to format
 * @param currency Currency code (default USD)
 */
export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
