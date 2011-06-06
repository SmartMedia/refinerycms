@refinerycms @pages @pages-publishing
Feature: Manage Pages
  In order to control the content on my website
  As an administrator
  I want to create and manage pages

  Background:
    Given I am a logged in refinery user
    And I have no pages

  @pages-publishing
  Scenario: Create Valid Page published in future
    When I go to the list of pages
    And I follow "Add new page"
    And I fill in "Title" with "Future page"
    And I fill in "Publish from" with next week date
    And I press "Save"
    Then I should see "'Future page' was successfully added."
    And I should have 1 unpublished page
    
  @pages-publishing
  Scenario: Create Valid Page without publish settings
    When I go to the list of pages
    And I follow "Add new page"
    And I fill in "Title" with "Published page"
    And I press "Save"
    Then I should see "'Published page' was successfully added."
    And I should have 1 published page

  @pages-publishing
  Scenario: Create Valid Page published in this week
    When I go to the list of pages
    And I follow "Add new page"
    And I fill in "Title" with "Future page"
    And I fill in "Publish to" with next week date
    And I press "Save"
    Then I should see "'Future page' was successfully added."
    And I should have 1 published page
