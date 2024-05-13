Feature: Feed Subscription Settings

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Unsubscribe from a feed
        When I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I click on 'Subscriptions'
        And pause
        And I click on the toggle button next to 'New Movies'
        And pause
        And I click on the 'x' icon
        And pause
        And I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I click on 'Subscriptions'
        And pause
        Then I see the 'This feed has no subscriptions yet.' text