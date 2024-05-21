Feature: Theme Switch

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        # And I click on 'Sign in / Register'
        # And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        # And I click on 'Get Magic Link'
        # And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        # And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        # Then I am at the 'Personal' feed

    Scenario: Validate the appearance of the dark mode Discover Feeds page
        When I click on the hamburger menu button
        And pause
        And I click on 'Switch to Dark Mode'
        And pause
        And I click on the hamburger menu button
        And pause
        And I click on 'Discover Feeds'
        And pause
        Then I verify the 'body' section appearance
        And pause

    Scenario: Validate the appearance of the dark mode Discover Communities page
        When I click on the hamburger menu button
        And pause
        And I click on 'Switch to Dark Mode'
        And pause
        And I click on the hamburger menu button
        And pause
        And I click on 'Discover Communities'
        And pause
        Then I verify the 'body' section appearance
        And pause

    Scenario: Validate the appearance of the dark mode Conversations page
        When I click on the hamburger menu button
        And pause
        And I click on 'Switch to Dark Mode'
        And pause
        And I click on the 'conversations' icon
        And pause
        And I click on 'Hero'
        And pause
        Then I verify the 'body' section appearance