Feature: Discover Feeds

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Accessing Feeds
        When I click on the hamburger menu button
        And I click on 'Discover Feeds'
        And I click on 'Personal'
        Then I see the 'Personal' title

    Scenario: Checking the amount of Feeds
        When I click on the hamburger menu button
        And I click on 'Discover Feeds'
        And pause
        Then I verify the number of feeds displayed is correct
    
    Scenario: Subscribing to the Feed
        When I click on the hamburger menu button
        And I click on 'Discover Feeds'
        And pause
        And I click on 'Personal'
        And pause
        And go back
        And pause
        And refresh
        And pause
        And I click on 'Personal'
        And go back
        And I click on 'Personal'
        And go back
        And I click on 'New Movies'
        And pause
        And I click on 'Subscribe'
        And pause
        And I click on 'Done'

# Scenario: Clicking the hamburger menu button
    #     When I click on the 'menu' icon
    #     And pause
