# Contributing

  Setting up the remotes:
    to set up a remote to your personal testing zone:
      git remote add personalDeploy ssh://<name>@alexmoor.es:2222/greenfield/<name>/deploy
    to set up a remote to the team staging zone:
      git remote add staging ssh://<name>@alexmoor.es:2222/greenfield/staging/deploy
    to set up a remote to the team LIVE zone:
      git remote add live ssh://<name>@alexmoor.es:2222/greenfield/live/deploy
    to set up a remote for the MAIN TEAM repo:
      git remote add upstream https://github.com/remote-control-pigeon/boogie-box.git

  Whenever you have made some changes:
    << make sure you've committed >>
    << push to your fork, just in case >>
      git push origin <branch name>
    << Test locally, and/or test in your personal test zone >>

  Whenever you've made changes that you want to merge with the MAIN REPO
    << make sure you've committed >>
    << pull down the most recent main repo, just in case >>
      git pull --rebase upstream <branch name>
    << fix any merge conflicts, if present >>
      << if you can easily fix them, do so >>
      << if you need to talk to someone to make sure you're understanding their changes >>
        << if you want to do something else while waiting for communication >>
          git rebase --abort
          << discuss with teammates, try again >>
            git pull --rebase upstream <branch name>
    << once your changes are all set, push to your fork >>
      git push origin <branch name>
    << create a pull request >>
      << go to your fork at github.com >>
      << create pull request >>
        << left part is your fork, and the current branch >>
        << right part is the main repo, and the current branch >>
      << Announce you've made a PR (it will also show up on Waffle) >>
      << wait for another teammate to review >>

  Whenever you've merged someone else's PR
    << Announce to the team >>

  Whenever a PR has been merged
    << pull down the main repo, current branch >>
      git pull --rebase upstream <branch name>
    << fix any merge conflicts, if present >>
      << if you can easily fix them, do so >>
      << if you need to talk to someone to make sure you're understanding their changes >>
        git rebase --abort
        << discuss with teammates, try again >>
          git pull --rebase upstream <branch name>

  Whenever changes should be brought to the release version:
    This will ALWAYS be a team effort, with much discussion. We will
    merge any and/or all feature branches with the master branch, and can
    move on to deploy to the live app

  Deployment options:
    To deploy to your personal test remote:
      << make sure you've committed >>
      << push to your remote repo >>
        git push personalDeploy <branch name>
      << connect via your port >>
        << Alex: 8081, Sean: 8082, Faiz: 8083, Mohammad: 8084 >>
    To deploy to the team staging remote:
      !! Only when merges are in, and we're testing the app as a team !!
      << make sure you have the MAIN repo of the whole organization >>
        git pull --rebase upstream <branch name>
      << push to the staging repo on the server >>
        git push staging <branch name>
      << connect via 8080 >>
    To deploy LIVE LIVE LIVE
      !! Only as a team, when we've decided our most recent merges
           behave as we want them to, and are ready to deploy the app
           for real !!
      << make sure you have the MAIN repo, MASTER branch >>
        git pull --rebase upstream master
      << push to live deploy repo >>
        git push live master
      << connect without a port >>


<!-- Links -->
[style guide]: https://github.com/reactorcore/style-guide
[n-queens]: https://github.com/reactorcore/n-queens
[Underbar]: https://github.com/reactorcore/underbar
[curriculum workflow diagram]: http://i.imgur.com/p0e4tQK.png
[cons of merge]: https://f.cloud.github.com/assets/1577682/1458274/1391ac28-435e-11e3-88b6-69c85029c978.png
[Bookstrap]: https://github.com/reactorcore/bookstrap
[Taser]: https://github.com/reactorcore/bookstrap
[tools workflow diagram]: http://i.imgur.com/kzlrDj7.png
[Git Flow]: http://nvie.com/posts/a-successful-git-branching-model/
[GitHub Flow]: http://scottchacon.com/2011/08/31/github-flow.html
[Squash]: http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html
