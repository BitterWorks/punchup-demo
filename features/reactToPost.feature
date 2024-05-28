Feature: React to Post

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Add reaction to a post
        When I hover over the post titled 'test post test pokus 2'
        And pause
        And I click on the 'emoji' icon
        And pause
        And I click on the 'checkMark' icon
        And pause

    # Scenario: Add the first post to Feed
    #     When I hover over the first post
    #     And pause
    #     And I click on the 'addToFeed' icon
    #     And pause
    #     And I select 'New Name' under 'Select a feed...'
    #     And pause
    #     And I click on 'Add to Feed'
    #     And I click on the 'New Name' feed
    #     Then I see the 'test post test pokus 2' post title

    Scenario: Add a post to Feed
        When I hover over the post titled 'test post test pokus 2'
        And I click on the 'addToFeed' icon
        And I select 'New Name' under 'Select a feed...'
        And I click on 'Add to Feed'
        And I click on the 'New Name' feed
        Then I see the 'test post test pokus 2' post title

    Scenario: Punish a post
        When I hover over the post titled 'test post test pokus 2'
        And I click on the 'punish' icon
        And pause
        #After that, the options to choose from are not clickable/working 

    Scenario: Report a post
        When I hover over the post titled 'A barge crashed into a bridge knocking it down'
        And pause
        And I click on the 'threeDots' icon
        And pause
        And I click on 'Report'
        And pause
        And I click on the 'Report' button