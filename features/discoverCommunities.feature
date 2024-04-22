Feature: Discover Communities

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Accessing Communities
        When I click on the hamburger menu button
        And I click on 'Discover Communities'
        And I click on 'Memes'
        And I see the 'Memes' title

    Scenario: Checking the amount of Communities
        When I click on the hamburger menu button
        And pause
        And I click on 'Discover Communities'
        And pause
        Then I verify the number of feeds displayed is correct
        # don't forget to change the 'Feeds' step for 'Communities'