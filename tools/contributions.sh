#!/usr/bin/env sh
# Writes data/contributions.json: the public GitHub contribution calendar for the snake game.
# Needs the gh CLI logged in (locally) or GH_TOKEN (in the workflow).
set -e
cd "$(dirname "$0")/.."
gh api graphql -f query='query{user(login:"VryDeveloper"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}' \
  --jq '.data.user.contributionsCollection.contributionCalendar
    | {total: .totalContributions,
       start: .weeks[0].contributionDays[0].date,
       weeks: [.weeks[] | [.contributionDays[] | [.contributionCount,
         ({NONE:0,FIRST_QUARTILE:1,SECOND_QUARTILE:2,THIRD_QUARTILE:3,FOURTH_QUARTILE:4}[.contributionLevel])]]]}' \
  > data/contributions.json
