Feature: Search Button

    Background: I am on punchup.com
        Given I go to the '/' page

    Scenario: Search for a user and verify the correctness
        When I click on the 'lens' icon
        And pause
        When I input 'Lucas' under 'Search'
        And pause
        Then I see the 'Lucas' user result
        And pause
        When I click the 'Lucas' user result
        And pause
        Then I see the 'Lucas' user profile