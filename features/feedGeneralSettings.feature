Feature: Feed General Settings

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Change the name of the feed
        When I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I clear the text under "Name"
        And I input 'New Name' under 'Name'
        And I click on the 'checkMark' icon
        And I pause
        And I click on the 'x' icon
        Then I see the 'New Name' Feed

    Scenario: Change the tagline of the feed
        When I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I clear the text under 'Tagline'
        And I input 'tagline for testing' under 'Tagline'
        And I click on the 'checkMark' icon
        And pause
        And I click on the 'x' icon
        And I click on the "New Name" Feed
        Then I see the 'tagline for testing' Feed tagline

    Scenario: Change the icon of the feed
        When I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I click on 'Change'
        And I click on the '🤠' emoji
        And I click on the 'x' icon
        And pause
        Then I see the '🤠' emoji next to 'New Name'
