Feature: Feed Subscription Settings

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Subscribe to a Feed
        When I click on the hamburger menu button
        And I click on 'Discover Feeds'
        And I click on 'Personal'
        And go back
        And refresh
        And I click on 'New Movies'
        And I wait for '2' seconds
        And I click on 'Subscribe'
        And If the 'New Name' feed is 'toggled' I click on it
        # maybe rework the step to the one on line 33?
        And I click on 'New Name'
        And I click on 'Done'
        Then I see the 'Subscribe' button
        # !!!ONLY 'Subscribe', NOT 'Subscribed' (two strings)!!!

    # Should I be subscribing to a feed at the beginning at the start of the scenario? It will fail if you are not subcribed to a feed.
    Scenario: Unsubscribe from a feed
        When I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I click on 'Subscriptions'
        And I click on the toggle button next to 'New Movies'
        And I click on the 'x' icon
        And I hover over the 'New Name' feed
        And I click on the 'gear' icon next to 'New Name'
        And I click on 'Subscriptions'
        Then I see the 'This feed has no subscriptions yet.' text