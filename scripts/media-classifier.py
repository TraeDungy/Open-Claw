#!/usr/bin/env python3.12
"""
TXF Media Classifier
Analyzes images and PDFs — categorizes as PROJECT (tied to a known project)
or REFERENCE (general reference material).

Usage:
  python3.12 media-classifier.py                        # analyze Downloads
  python3.12 media-classifier.py --folder ~/Documents   # analyze other folder
  python3.12 media-classifier.py --move                 # move files after classifying
  python3.12 media-classifier.py --no-ai                # filename-only, no API calls
"""

import os
import sys
import json
import csv
import base64
import shutil
import argparse
import mimetypes
import time
from pathlib import Path
from datetime import datetime

# ─── KNOWN TXF PROJECTS ─────────────────────────────────────────────────────

KNOWN_PROJECTS = {
    "Film Plug": ["film plug", "filmplug", "film-plug", "fp studios", "film plug studios"],
    "Trial X Fire": ["trial x fire", "trialxfire", "txf", "trial-x-fire"],
    "Tubi": ["tubi", "adrise", "0rampimjk5q8", "tubi ballin", "tubi 25", "tubi 26", "tubi oct"],
    "Outlaw Empire": ["outlaw empire", "outlaw-empire", "oe sample", "port city"],
    "Caged": ["caged", "_caged_"],
    "Chappie": ["chappie", "chappie o"],
    "Everyday Is Friday": ["everyday is friday", "everyday_is_friday", "e20", "e13", "e15"],
    "Homicide Hartford": ["homicide hartford", "hartford 860"],
    "Philly Uncut": ["philly uncut", "phillyuncut", "philly-uncut"],
    "Slime City": ["slime city", "slime-city"],
    "Dirty Spring": ["dirty spring"],
    "Laced Tribe": ["laced tribe", "laced-tribe"],
    "Coyote Creek": ["coyote creek", "coyote-creek"],
    "Comedy Kickback": ["comedy kickback", "comedy-kickback", "creators kick", "creators kickback"],
    "Spirit Flame": ["spirit flame", "spirit-flame", "spirit relaxation"],
    "Alien Worlds": ["alien world", "alien_world", "alien-world"],
    "Thugs Cry": ["thugs cry", "thugs-cry"],
    "Dead Alive": ["dead alive", "dead-alive"],
    "Royalty X": ["royalty x", "royaltyx", "royalty-x", "royaltystatement", "royalty statement"],
    "Joseph": ["joseph dvd", "joseph.iso", "joseph_"],
    "Drought": ["drought", "drout"],
    "Ballin": ["ballin", "official_ballin"],
    "Eye Shot": ["eye shot", "eye_shot", "eyeshot"],
    "Fractured Not Broken": ["fractured not broken", "fractured_not_broken"],
    "American Hood Story": ["american hood story", "american-hood"],
    "Femis Comedy": ["femis comedy", "femis-comedy"],
    "Invisible Vegan": ["invisible vegan", "invisible-vegan"],
    "New Heat": ["new heat", "new_heat", "project heat"],
    "Street Stories": ["street stories", "street_stories"],
    "Gumbo": ["gumbo 1920", "gumbo 1400"],
    "Dopeboy Nightmares": ["dopeboy", "dopeboy nightmares"],
    "Sinful Lies": ["sinful lies", "sinful-lies"],
    "Glass Half Empty": ["glass half"],
    "Adora": ["adora 1920", "adora.srt"],
    "Booked in the City": ["booked in the city", "booked-in-the-city"],
    "Samurai Cinema": ["samurai cinema"],
    "Boss Status": ["boss_status", "boss status"],
    "Knock": ["knock poster", "knock 900"],
    "Love Sex Kung Fu": ["love sex", "lovesex", "kung fu"],
    "Runner": ["filemail.com - runner"],
    "Sister Vibes": ["sister vibes", "sister-vibes"],
    "Grimy": ["grimy.png", "grimy season"],
    "Funny Black History": ["funny black history"],
    "Girls on the Yard": ["girls on the yard", "girls_yard"],
    "Misha Healing": ["misha healing", "misha-healing"],
    "Life Alpha Male": ["life of an alpha male", "alpha male 1920"],
    "Enter the Jungle": ["enter the jungle"],
    "Jade": ["jade 2000", "jade poster"],
    "Wonderland Walk": ["wonderland walk"],
    "Royalty Statement": ["royalty statement & payment", "royalty-payment"],
    "Breakout TV": ["breakout tv"],
    "Laffapalooza": ["laffapalooza"],
    "Commentary/Podcast": ["podcast", "projek realness"],
    "Gotham Comedy": ["gotham comedy"],
    "Thugs Cry Music": ["thugs cry"],
    "Revenue Reports": ["revenuereport", "revenue-report", "streamingreport", "vod_pv"],
    "Tax Documents": ["1099", "w9", "tax return", "1040", "f1099", "nec_from", "revenuereport"],
}

REFERENCE_KEYWORDS = [
    "sample", "template", "stock", "reference", "example", "demo", "test",
    "inspiration", "mood board", "moodboard", "font", "vtks", "typeface",
    "concrete", "water bottle", "netflix content", "metacomet", "pitch deck",
    "investment pkg", "how to", "tutorial", "guide", "cheat sheet",
    "dmg", "installer", "setup", "upscayl", "vlc", "ffmpeg", "winx",
    "warranty", "autorun", "readme",
]

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"}
PDF_EXTS = {".pdf"}
SUPPORTED_EXTS = IMAGE_EXTS | PDF_EXTS

# ─── FOLDER → PROJECT/CATEGORY MAP ──────────────────────────────────────────

FOLDER_PROJECT_MAP = {
    # TXF / Film Plug
    "trial x fire artwork": ("project", "Trial X Fire"), "trial x fire still": ("project", "Trial X Fire"),
    "filmplugstudiosimages": ("project", "Film Plug"), "film plug posters": ("project", "Film Plug"),
    "film plug 2": ("project", "Film Plug"), "film plug": ("project", "Film Plug"),
    # Films
    "slime cast photos": ("project", "Slime City"), "slime": ("project", "Slime City"),
    "wetransfer_slime-city-poster-1-2-mp4_2022-01-26_1338": ("project", "Slime City"),
    "wetransfer_slime-city-poster-1-2-mp4_2022-01-26_1338-1": ("project", "Slime City"),
    "blackslasherartwork": ("project", "Black Slasher"), "black slasher trailer artwork": ("project", "Black Slasher"),
    "stills for black slasher": ("project", "Black Slasher"), "black slasher": ("project", "Black Slasher"),
    "bloody neighborhood _ screener": ("project", "Bloody Neighborhood"),
    "booked in the city": ("project", "Booked In The City"),
    "fwdbookedinthecitypictures": ("project", "Booked In The City"), "fwdbookedinthecitypictures-1": ("project", "Booked In The City"),
    "comedy kickback images trae": ("project", "Comedy Kickback"), "comedy kickback kendra": ("project", "Comedy Kickback"),
    "comedy kickback ms zo": ("project", "Comedy Kickback"),
    "copy of samurai cinema": ("project", "Samurai Cinema"), "samurai cinema": ("project", "Samurai Cinema"),
    "laced tribe": ("project", "Laced Tribe"), "drought": ("project", "Drought"),
    "outlawempiretrappersandhustlers": ("project", "Outlaw Empire"),
    "custom outlaw empire assets": ("project", "Outlaw Empire"), "oe asset packs": ("project", "Outlaw Empire"),
    "outlawassetstestvideoandscreenshots": ("project", "Outlaw Empire"),
    "outlawassetstestvideoandscreenshots-1": ("project", "Outlaw Empire"),
    "outlawassetstestvideoandscreenshots-2": ("project", "Outlaw Empire"),
    "outlawassetstestvideoandscreenshots-3": ("project", "Outlaw Empire"),
    "outlawassetsscreenshots": ("project", "Outlaw Empire"),
    "reballintrailer": ("project", "Ballin"),
    "like it was yesterday": ("project", "Like It Was Yesterday"),
    "docusigned_like_it_was_yesterday___trial_x_f": ("project", "Like It Was Yesterday"),
    "wetransfer_remember-tomorrow-1920x1080-psd_2022-09-20_1339": ("project", "Remember Tomorrow"),
    "remember tomorrow": ("project", "Remember Tomorrow"),
    "love sex and kung fu": ("project", "Love Sex and Kung Fu"),
    "wetransfer_life-of-an-alpha-male-1920x1080-psd_2022-09-09_1525": ("project", "Life of Alpha Male"),
    "wetransfer_life-of-an-alpha-male0-psd_2022-09-13_1706": ("project", "Life of Alpha Male"),
    "life of a alpha male": ("project", "Life of Alpha Male"),
    "wetransfer_movie-poster_2022-08-23_1709": ("project", "Film Posters"),
    "wetransfer_movie-poster_2022-08-23_1709(1)": ("project", "Film Posters"),
    "wetransfer_poster-final-psd_2022-09-26_0047": ("project", "Film Posters"),
    "wetransfer_lanscape-verison-psd_2023-07-20_2020": ("project", "Film Posters"),
    "wetransfer_artwork-files_2025-12-27_0225": ("project", "Film Posters"),
    "posters": ("project", "Film Posters"), "cover art": ("project", "Film Artwork"),
    "misha": ("project", "Misha Healing"), "some kind of christmas": ("project", "Some Kind of Christmas"),
    "some kind of christmas(1)": ("project", "Some Kind of Christmas"),
    "adora": ("project", "Adora"), "infamous": ("project", "Infamous"),
    "b.o.s.s. ep. 2": ("project", "B.O.S.S."), "boss 2": ("project", "B.O.S.S."), "boss2": ("project", "B.O.S.S."),
    "thugs cry production binder": ("project", "Thugs Cry"),
    "thugscrycastlistandlocations": ("project", "Thugs Cry"), "thugscrycastlistandlocations(1)": ("project", "Thugs Cry"),
    "fwdthugscrytheseries": ("project", "Thugs Cry"),
    "coyote creek images": ("project", "Coyote Creek"),
    "crownology images": ("project", "Crownology"), "projectheat": ("project", "Project Heat"),
    "emerald green and white gallery photos": ("project", "Emerald Green & White"),
    "the secret of the emerald green _ white": ("project", "Emerald Green & White"),
    "the secret of emerald green & white": ("project", "Emerald Green & White"),
    "squad goals": ("project", "Squad Goals"), "ultraviolet project": ("project", "Ultraviolet"),
    "a detective story": ("project", "A Detective Story"), "realityshow": ("project", "Reality Show"),
    "12 yrs in hell": ("project", "12 Years in Hell"), "12 years in hell": ("project", "12 Years in Hell"),
    "retequillaempire": ("project", "Tequila Empire"),
    "wetransfer_kaundra_milan_falls_2023-09-07_0002": ("project", "Kaundra Milan Falls"),
    "wetransfer_kaundra_milan_falls_2023-09-07_0002(1)": ("project", "Kaundra Milan Falls"),
    "wetransfer_kaundra_milan_falls_2023-09-07_0002(1) 2": ("project", "Kaundra Milan Falls"),
    "philly uncut 3": ("project", "Philly Uncut"),
    "snow bunnies _ philly uncut metadata files": ("project", "Snow Bunnies"),
    # Filemail submissions
    "filemail.com - homicide hartford season 1": ("project", "Homicide Hartford"),
    "filemail.com - like it was yesterday film": ("project", "Like It Was Yesterday"),
    "filemail.com - the relapse - film": ("project", "The Relapse"),
    "filemail.com - a cup full of crazy_jbullock": ("project", "A Cup Full of Crazy"),
    "filemail.com - dead alive filme series(1)": ("project", "Dead Alive"),
    "filemail.com - 773 the go": ("project", "773 The Go"), "773 the go intro": ("project", "773 The Go"),
    "filemail.com - 5050 files": ("project", "5050 Films"), "5050 films": ("project", "5050 Films"),
    "filemail.com - b.o.s.s. ep. 3 deliverables(1)": ("project", "B.O.S.S."),
    "filemail.com - b.o.s.s. ep. 3 deliverables.zip 2": ("project", "B.O.S.S."),
    "filemail.com - breakouttvnetwork": ("project", "Breakout TV"),
    "filemail.com - legend has it submission files": ("project", "Legend Has It"),
    "filemail.com - no limit pro wrestling": ("project", "No Limit Pro Wrestling"),
    "filemail.com - no limit pro wrestling(1)": ("project", "No Limit Pro Wrestling"),
    "filemail.com - peace makers 2 supremes revenge": ("project", "PeaceMakers"),
    "filemail.com - peacemakers film": ("project", "PeaceMakers"),
    "filemail.com - podcast episodes": ("project", "Podcast"),
    "filemail.com - new podcast- projek realness": ("project", "Podcast"),
    "filemail.com - ron clemons - short film files(1)": ("project", "Ron Clemons Film"),
    "filemail.com - sgs 2 new videos": ("project", "So Gorilla Streaming"),
    "filemail.com - so gorilla streaming network deliverables": ("project", "So Gorilla Streaming"),
    "filemail.com - so gorilla streaming network deliverables-1": ("project", "So Gorilla Streaming"),
    "sgs channel files": ("project", "So Gorilla Streaming"), "sgs content": ("project", "So Gorilla Streaming"),
    "filemail.com - snow bunnies": ("project", "Snow Bunnies"),
    "filemail.com - the fourth sin": ("project", "The Fourth Sin"),
    "filemail.com - the movie karma": ("project", "The Movie Karma"),
    "filemail.com - walk in my shoes": ("project", "Walk In My Shoes"),
    "filemail.com - were still family trailer and episodes": ("project", "We're Still Family"),
    "filemail.com - wingmen files": ("project", "Wingmen"), "wingmen promo photos": ("project", "Wingmen"),
    "fwdwingmenfiles(1)": ("project", "Wingmen"),
    "filemail.com - yung cat movie": ("project", "Yung Cat"),
    "filemail.com - 3bodies movie upload": ("project", "3 Bodies"),
    "filemail.com - da p movie pilot and trailer(1)": ("project", "Da P Movie"),
    "filemail.com - episode # 10 - come correct starring dezi stormz": ("project", "Comedy Series"),
    "filemail.com - episode # 12 - thicker than a snicker starring yanni maj": ("project", "Comedy Series"),
    "filemail.com - movie file with trailer": ("project", "Film Submission"),
    "filemail.com - updated posters": ("project", "Film Posters"),
    "filemail.com - ads": ("project", "Film Plug Ads"),
    "filemail.com - runner": ("project", "Filemail Runner"),
    "fwdfunnyblackhistorypromotionalimagephotoshopfile": ("project", "Funny Black History"),
    "fwdfilmplacementsubmissionbyyellogenix": ("project", "Film Placement"),
    "fwdtxfamazon": ("project", "Trial X Fire"),
    # Tubi
    "tubi(1)": ("project", "Tubi"), "tubi-metadata-csv": ("project", "Tubi"),
    # Business / Finance
    "statements_2022-08-10": ("project", "Royalty Statements"), "statements_2022-09-07": ("project", "Royalty Statements"),
    "statements_2022-09-14 on hold": ("project", "Royalty Statements"), "statements_2022-12-16 q3 v1": ("project", "Royalty Statements"),
    "statements_2023-03-19": ("project", "Royalty Statements"), "statements_2023-03-19(1)": ("project", "Royalty Statements"),
    "statements_2023-05-29": ("project", "Royalty Statements"), "statements_2023-09-21": ("project", "Royalty Statements"),
    "statements_2024-01-16 (1)": ("project", "Royalty Statements"), "statements_2024-03-29 not on hold": ("project", "Royalty Statements"),
    "statements_2024-04-04 not on hold": ("project", "Royalty Statements"), "statements_2024-06-26 not on hold": ("project", "Royalty Statements"),
    "statements_2024-06-26 not on hold 2": ("project", "Royalty Statements"), "statements_2024-06-26 on hold": ("project", "Royalty Statements"),
    "statements_2024-10-17": ("project", "Royalty Statements"), "statements_2024-10-17 2": ("project", "Royalty Statements"),
    "statements_2024-10-17 3": ("project", "Royalty Statements"), "statements_2025-02-03": ("project", "Royalty Statements"),
    "statements_2025-02-06": ("project", "Royalty Statements"), "statements_2025-02-06 2": ("project", "Royalty Statements"),
    "statements_2025-02-06 3": ("project", "Royalty Statements"), "statements_not on hold q1_23": ("project", "Royalty Statements"),
    "statements_q2_23_sent": ("project", "Royalty Statements"), "statements_q2_23_sent(1)": ("project", "Royalty Statements"),
    "completedroyalties": ("project", "Royalty Statements"), "q2 2021 statements": ("project", "Royalty Statements"),
    "q2 2021 statements-1": ("project", "Royalty Statements"), "jan-mar q1 and march stmts": ("project", "Royalty Statements"),
    "jan-mar q1 and march stmts-1": ("project", "Royalty Statements"), "statements": ("project", "Royalty Statements"),
    "statements-1": ("project", "Royalty Statements"), "statements(1)": ("project", "Royalty Statements"),
    "statements3": ("project", "Royalty Statements"), "trae dungy statments": ("project", "Royalty Statements"),
    "statementforq12024andpaymentreportfinal": ("project", "Royalty Statements"),
    "statementsandpaymentreport": ("project", "Royalty Statements"), "statementswereemailed": ("project", "Royalty Statements"),
    "statusofq4": ("project", "Royalty Statements"), "q2txfsalesreports": ("project", "Royalty Statements"),
    "reroyaltystatementsfromtrialxfire(1)": ("project", "Royalty Statements"),
    "8659 - txf bussiness-20220428": ("project", "TXF Bank Statements"), "8659 - txf bussiness-20220526": ("project", "TXF Bank Statements"),
    "8659 - txf bussiness-20220815": ("project", "TXF Bank Statements"), "8659 - txf bussiness-20231126": ("project", "TXF Bank Statements"),
    "8659-txf bussiness-20210614": ("project", "TXF Bank Statements"), "8659-txf bussiness-20210717": ("project", "TXF Bank Statements"),
    "8659-txf bussiness-20210720": ("project", "TXF Bank Statements"), "8659-txf bussiness-20210830": ("project", "TXF Bank Statements"),
    "8659-txf bussiness-20211207": ("project", "TXF Bank Statements"), "8659-txf bussiness-20220110": ("project", "TXF Bank Statements"),
    "8659-txf bussiness-20220311": ("project", "TXF Bank Statements"), "8659-txf bussiness-20220413": ("project", "TXF Bank Statements"),
    "8659 - txf bussiness-20220815(1)": ("project", "TXF Bank Statements"), "8659-txf bussiness-20220311-1": ("project", "TXF Bank Statements"),
    "8659 - txf bussiness-20220815(1)": ("project", "TXF Bank Statements"),
    "3557-uhe bussiness-20220210": ("project", "UHE Bank Statements"),
    "9294-personal-20220322": ("project", "Personal Bank Statements"), "9294-personal-20220412": ("project", "Personal Bank Statements"),
    "1099nec_trialxfirellc_146": ("project", "Tax Documents"), "1099nec_trialxfirellc_146 2": ("project", "Tax Documents"),
    "1099nec_trialxfirellc_146 3": ("project", "Tax Documents"), "1099nec_trialxfirellc_288": ("project", "Tax Documents"),
    "1099nec_trialxfirellc_676": ("project", "Tax Documents"),
    "invoiceswhichwerepaidin2022thatineed1099for": ("project", "Tax Documents"),
    "reinvoiceswhichwerepaidin2022thatineed1099for": ("project", "Tax Documents"),
    "retxfbusinessaccountstatements": ("project", "TXF Bank Statements"),
    "all files": ("project", "Royalty Statements"), "all files 2": ("project", "Royalty Statements"),
    "licensing": ("project", "Licensing"), "deposit": ("project", "TXF Finance"),
    "txfdecember2022jan2023amazonpayment": ("project", "TXF Finance"),
    "creditletteraction": ("project", "TXF Finance"), "creditletteraction-1": ("project", "TXF Finance"),
    # Talent / Casting
    "showtime model casting #2": ("reference", "Talent Casting"), "showtime model casting #2 2": ("reference", "Talent Casting"),
    "derek": ("reference", "Talent Headshots"), "melissa": ("reference", "Talent Headshots"),
    "liona": ("reference", "Talent Headshots"), "tay": ("reference", "Talent Headshots"),
    "kendra": ("reference", "Talent Headshots"), "man": ("reference", "Talent Headshots"),
    "ot": ("reference", "Talent Headshots"), "trae": ("reference", "Personal Photos"),
    "trae 2": ("reference", "Personal Photos"),
    "wetransfer_indie-audition-request_2023-09-05_2234(1)": ("reference", "Talent Casting"),
    # Reference / Assets
    "goat yoga": ("reference", "Client - Goat Yoga"), "goat yoga(1)": ("reference", "Client - Goat Yoga"),
    "goat yoga(2)": ("reference", "Client - Goat Yoga"), "goat yoga(3)": ("reference", "Client - Goat Yoga"),
    "goat yoga(4)": ("reference", "Client - Goat Yoga"), "goat yoga(5)": ("reference", "Client - Goat Yoga"),
    "seafood restaurant": ("reference", "Client - Seafood Restaurant"),
    "sekaya make up": ("reference", "Client - Sekaya Makeup"),
    "aaron's spring roll pics and videos": ("reference", "Personal"),
    "producer master class": ("reference", "Education"), "producer master class(1)": ("reference", "Education"),
    "ai film marketing tactics(1)": ("reference", "Education"),
    "strawesome deck pitches": ("reference", "Pitch Decks"), "pitch decks": ("reference", "Pitch Decks"),
    "moviedecks": ("reference", "Pitch Decks"),
    "vtks-criminal-75": ("reference", "Fonts"), "vtks-kartazis": ("reference", "Fonts"),
    "vtks-milkshake": ("reference", "Fonts"), "vtks-ragwaris": ("reference", "Fonts"),
    "fonts": ("reference", "Fonts"), "trueType": ("reference", "Fonts"),
    "dot matrix": ("reference", "Fonts"), "free modern kallimata font": ("reference", "Fonts"),
    # Game assets (from game dev project)
    "tiles": ("reference", "Game Assets"), "topdown vehicles v1.17": ("reference", "Game Assets"),
    "simple town": ("reference", "Game Assets"), "city_tilemap": ("reference", "Game Assets"),
    "simple_house_interiors": ("reference", "Game Assets"), "simple_people": ("reference", "Game Assets"),
    "simplepeople": ("reference", "Game Assets"), "kenney_monochromerpg": ("reference", "Game Assets"),
    "kenney_rpgurbankit": ("reference", "Game Assets"), "kenney_rpgurbankit 2": ("reference", "Game Assets"),
    "vehicles": ("reference", "Game Assets"), "citybuilderfreepacks": ("reference", "Game Assets"),
    "ambulance topdown": ("reference", "Game Assets"), "box truck topdown": ("reference", "Game Assets"),
    "bus topdown": ("reference", "Game Assets"), "camper topdown": ("reference", "Game Assets"),
    "civic topdown": ("reference", "Game Assets"), "coupe topdown": ("reference", "Game Assets"),
    "hatchback topdown": ("reference", "Game Assets"), "jeep top down": ("reference", "Game Assets"),
    "limo topdown": ("reference", "Game Assets"), "luxury topdown": ("reference", "Game Assets"),
    "medium truck topdown": ("reference", "Game Assets"), "micro topdown": ("reference", "Game Assets"),
    "minivan topdown": ("reference", "Game Assets"), "musclecar topdown": ("reference", "Game Assets"),
    "pickup topdown": ("reference", "Game Assets"), "police topdown": ("reference", "Game Assets"),
    "sedan topdown": ("reference", "Game Assets"), "sport topdown": ("reference", "Game Assets"),
    "supercar topdown": ("reference", "Game Assets"), "suv topdown": ("reference", "Game Assets"),
    "taxi topdown": ("reference", "Game Assets"), "van top down": ("reference", "Game Assets"),
    "wagon topdown": ("reference", "Game Assets"),
    # Misc reference
    "premium plugins": ("reference", "Software"), "wordpress themes": ("reference", "Software"),
    "drive-download-20230118t232715z-001": ("reference", "Google Drive Download"),
    "drive-download-20231031t042219z-001": ("reference", "Google Drive Download"),
    "drive-download-20251113t054817z-1-001": ("reference", "Google Drive Download"),
    "bcm catalogfiles": ("reference", "BCM Catalog"), "untitled design(1)": ("reference", "Design Work"),
    "untitled design(2)": ("reference", "Design Work"), "untitled design(3)": ("reference", "Design Work"),
    "untitled export": ("reference", "Export"), "untitled export 2": ("reference", "Export"),
    "stocks": ("reference", "Stock Assets"), "assets without captions": ("project", "Film Assets"),
    "psd files": ("project", "Film Artwork"), "psd files 2": ("project", "Film Artwork"),
}

def get_folder_classification(filepath: Path) -> tuple[str, str, float]:
    """Classify based on parent folder name"""
    # Check all parent folders up to Downloads
    for parent in filepath.parents:
        folder_name = parent.name.lower()
        if folder_name in FOLDER_PROJECT_MAP:
            cat, proj = FOLDER_PROJECT_MAP[folder_name]
            return cat, proj, 0.92
        # Partial match for Filemail / wetransfer / statements patterns
        if folder_name.startswith("filemail.com - "):
            proj = folder_name.replace("filemail.com - ", "").title()
            return "project", proj, 0.88
        if folder_name.startswith("wetransfer_"):
            return "reference", "WeTransfer Download", 0.80
        if folder_name.startswith("statements_") or folder_name.startswith("statements "):
            return "project", "Royalty Statements", 0.90
        if folder_name.startswith("8659"):
            return "project", "TXF Bank Statements", 0.90
        if folder_name.startswith("9294-personal"):
            return "project", "Personal Bank Statements", 0.90
        if folder_name.startswith("1099nec"):
            return "project", "Tax Documents", 0.90
        if "outlaw" in folder_name:
            return "project", "Outlaw Empire", 0.88
        if "thugs cry" in folder_name:
            return "project", "Thugs Cry", 0.88
        if "comedy kickback" in folder_name:
            return "project", "Comedy Kickback", 0.88
        if folder_name in ("downloads",):
            break
    return "", "", 0.0


# ─── FILENAME CLASSIFIER ─────────────────────────────────────────────────────

def classify_by_filename(filepath: Path) -> tuple[str, str, float]:
    """Returns (category, project_name, confidence)"""
    name = filepath.name.lower()
    stem = filepath.stem.lower()

    # Check known projects
    for project, keywords in KNOWN_PROJECTS.items():
        for kw in keywords:
            if kw in name:
                return "project", project, 0.95

    # Check reference keywords
    for kw in REFERENCE_KEYWORDS:
        if kw in name:
            return "reference", "General Reference", 0.85

    # UUID-style filenames = likely downloads/reference
    import re
    if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-', stem):
        return "reference", "General Reference", 0.75

    # Numbered bulk files
    if re.match(r'^\d+\.(jpg|jpeg|png)$', filepath.name.lower()):
        return "unknown", "", 0.0

    # WeTransfer folders
    if "wetransfer" in name:
        return "reference", "WeTransfer Download", 0.7

    return "unknown", "", 0.0


# ─── AI CLASSIFIER ───────────────────────────────────────────────────────────

def encode_image(filepath: Path, max_size: int = 800) -> tuple[str, str]:
    """Encode image as base64, resized if needed. Returns (base64_data, media_type)"""
    from PIL import Image
    import io

    ext = filepath.suffix.lower()
    media_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                 ".png": "image/png", ".gif": "image/gif",
                 ".webp": "image/webp", ".bmp": "image/png"}
    media_type = media_map.get(ext, "image/jpeg")

    try:
        with Image.open(filepath) as img:
            # Resize to save tokens
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size), Image.LANCZOS)
            # Convert to RGB if needed
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
                media_type = "image/jpeg"
            buf = io.BytesIO()
            fmt = "JPEG" if media_type == "image/jpeg" else "PNG"
            img.save(buf, format=fmt, quality=75)
            return base64.standard_b64encode(buf.getvalue()).decode(), media_type
    except Exception:
        # Fallback: raw encode
        with open(filepath, "rb") as f:
            return base64.standard_b64encode(f.read()).decode(), media_type


def encode_pdf(filepath: Path, max_pages: int = 2) -> str:
    """Encode first N pages of PDF as base64"""
    with open(filepath, "rb") as f:
        return base64.standard_b64encode(f.read()).decode()


CLASSIFIER_PROMPT = """You are classifying a media file for Trial X Fire, a film/content distribution company.

Known TXF projects include: Film Plug, Outlaw Empire, Caged, Chappie, Everyday Is Friday,
Homicide Hartford, Philly Uncut, Slime City, Laced Tribe, Coyote Creek, Comedy Kickback,
Spirit Flame, Alien Worlds, Thugs Cry, Dead Alive, Drought, Ballin, Eye Shot, American Hood Story,
New Heat, Street Stories, Gumbo, Sinful Lies, Adora, Knock, Misha Healing, Wonderland Walk,
Booked in the City, Samurai Cinema, and others.

Filename: {filename}

Classify this file as either:
- PROJECT: directly related to a specific TXF/Film Plug production, project, or business operation
- REFERENCE: general reference material, inspiration, stock content, or unrelated download

Respond ONLY with valid JSON:
{{"category": "project" or "reference", "project_name": "name of project or empty string", "confidence": 0.0-1.0, "reason": "brief reason"}}"""


def build_batch_requests(files: list[Path]) -> list[dict]:
    """Build Batch API requests for a list of files"""
    requests = []

    for i, filepath in enumerate(files):
        ext = filepath.suffix.lower()
        try:
            if ext in IMAGE_EXTS:
                # Check if PIL is available
                try:
                    img_data, media_type = encode_image(filepath)
                    content = [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": media_type, "data": img_data}
                        },
                        {
                            "type": "text",
                            "text": CLASSIFIER_PROMPT.format(filename=filepath.name)
                        }
                    ]
                except Exception:
                    # No PIL, skip vision
                    content = [{"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name) + f"\n(Image file, no preview available)"}]

            elif ext in PDF_EXTS:
                # Use document type for PDFs
                try:
                    pdf_data = encode_pdf(filepath)
                    content = [
                        {
                            "type": "document",
                            "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_data}
                        },
                        {
                            "type": "text",
                            "text": CLASSIFIER_PROMPT.format(filename=filepath.name)
                        }
                    ]
                except Exception:
                    content = [{"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name)}]
            else:
                continue

            requests.append({
                "custom_id": f"file-{i}",
                "params": {
                    "model": "claude-haiku-4-5",
                    "max_tokens": 200,
                    "messages": [{"role": "user", "content": content}]
                }
            })
        except Exception as e:
            print(f"  ⚠ Skipping {filepath.name}: {e}")

    return requests


# ─── MAIN ────────────────────────────────────────────────────────────────────

def scan_folder(folder: Path) -> list[Path]:
    """Find all images and PDFs in folder"""
    files = []
    for f in folder.rglob("*"):
        if f.suffix.lower() in SUPPORTED_EXTS and f.is_file():
            files.append(f)
    return sorted(files)


def suggest_folder(category: str, project_name: str, file_ext: str, base_folder: Path) -> Path:
    """Suggest destination folder for a file"""
    if category == "project" and project_name:
        safe_name = project_name.replace("/", "-").replace(":", "-")
        return base_folder / "Organized" / "Projects" / safe_name
    else:
        if file_ext in IMAGE_EXTS:
            return base_folder / "Organized" / "Reference" / "Images"
        else:
            return base_folder / "Organized" / "Reference" / "Documents"


def write_html_report(results: list[dict], output_path: Path):
    """Write a visual HTML report"""
    now = datetime.now().strftime("%B %d, %Y %I:%M %p")
    projects = {}
    references = []
    unknowns = []

    for r in results:
        if r["category"] == "project":
            p = r["project_name"] or "Unknown Project"
            projects.setdefault(p, []).append(r)
        elif r["category"] == "reference":
            references.append(r)
        else:
            unknowns.append(r)

    rows = ""
    for r in sorted(results, key=lambda x: (x["category"], x.get("project_name", ""))):
        badge_color = "#4ade80" if r["category"] == "project" else "#60a5fa" if r["category"] == "reference" else "#fbbf24"
        rows += f"""
        <tr>
          <td class="filename">{r['filename']}</td>
          <td><span class="badge" style="background:{badge_color}20;color:{badge_color};border:1px solid {badge_color}40">{r['category'].upper()}</span></td>
          <td>{r.get('project_name','')}</td>
          <td>{int(r.get('confidence',0)*100)}%</td>
          <td class="source">{r.get('source','filename')}</td>
          <td class="reason">{r.get('reason','')}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TXF Media Classification Report</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ background: #0d0d0d; color: #e0e0e0; font-family: 'SF Mono', monospace; padding: 32px; }}
    h1 {{ color: #fff; font-size: 22px; margin-bottom: 6px; }}
    .sub {{ color: #444; font-size: 12px; margin-bottom: 28px; }}
    .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }}
    .stat {{ background: #161616; border: 1px solid #222; border-radius: 10px; padding: 16px; }}
    .stat h2 {{ font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }}
    .stat .n {{ font-size: 30px; font-weight: bold; color: #fff; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 12px; }}
    th {{ background: #161616; color: #555; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }}
    td {{ padding: 8px 12px; border-bottom: 1px solid #1a1a1a; vertical-align: top; }}
    tr:hover td {{ background: #111; }}
    .filename {{ color: #aaa; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
    .badge {{ padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }}
    .reason {{ color: #444; font-size: 11px; max-width: 200px; }}
    .source {{ color: #333; font-size: 10px; }}
  </style>
</head>
<body>
  <h1>⚡ TXF MEDIA CLASSIFICATION REPORT</h1>
  <div class="sub">Generated {now} — {len(results)} files analyzed</div>
  <div class="stats">
    <div class="stat"><h2>Total Files</h2><div class="n">{len(results)}</div></div>
    <div class="stat"><h2>Projects</h2><div class="n" style="color:#4ade80">{sum(1 for r in results if r['category']=='project')}</div></div>
    <div class="stat"><h2>Reference</h2><div class="n" style="color:#60a5fa">{sum(1 for r in results if r['category']=='reference')}</div></div>
    <div class="stat"><h2>Unknown</h2><div class="n" style="color:#fbbf24">{sum(1 for r in results if r['category']=='unknown')}</div></div>
  </div>
  <table>
    <thead>
      <tr><th>Filename</th><th>Category</th><th>Project</th><th>Confidence</th><th>Source</th><th>Reason</th></tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>
</body>
</html>"""

    with open(output_path, "w") as f:
        f.write(html)


def main():
    parser = argparse.ArgumentParser(description="TXF Media Classifier")
    parser.add_argument("--folder", default=str(Path.home() / "Downloads"), help="Folder to scan")
    parser.add_argument("--move", action="store_true", help="Actually move files (default: dry run)")
    parser.add_argument("--no-ai", action="store_true", help="Skip AI analysis, filename-only")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of AI calls (0=all)")
    parser.add_argument("--output", default=str(Path.home() / "Downloads" / "classification-report"), help="Output base path (no extension)")
    args = parser.parse_args()

    folder = Path(args.folder).expanduser()
    output_base = Path(args.output).expanduser()

    print(f"\n⚡ TXF MEDIA CLASSIFIER")
    print(f"   Scanning: {folder}")
    print(f"   Mode: {'MOVE' if args.move else 'DRY RUN'}")
    print(f"   AI: {'disabled' if args.no_ai else 'enabled (Haiku batch)'}\n")

    # 1. Scan for files
    print("📂 Scanning for images and PDFs...")
    all_files = scan_folder(folder)
    print(f"   Found {len(all_files):,} files\n")

    # 2. Filename classification
    print("🔍 Running filename classifier...")
    results = []
    uncertain_files = []

    for filepath in all_files:
        category, project_name, confidence = classify_by_filename(filepath)
        source = "filename"

        # If filename didn't resolve it, try folder context
        if category == "unknown":
            f_cat, f_proj, f_conf = get_folder_classification(filepath)
            if f_cat:
                category, project_name, confidence = f_cat, f_proj, f_conf
                source = "folder"

        result = {
            "filepath": str(filepath),
            "filename": filepath.name,
            "ext": filepath.suffix.lower(),
            "category": category,
            "project_name": project_name,
            "confidence": confidence,
            "source": source,
            "reason": f"Keyword match: {project_name}" if source == "filename" and project_name else
                      f"Folder: {filepath.parent.name}" if source == "folder" else "No keyword match",
            "suggested_folder": str(suggest_folder(category, project_name, filepath.suffix.lower(), folder))
        }
        results.append(result)
        if category == "unknown":
            uncertain_files.append(filepath)

    by_filename = sum(1 for r in results if r["source"] == "filename")
    by_folder   = sum(1 for r in results if r["source"] == "folder")
    print(f"   Classified by filename: {by_filename:,}")
    print(f"   Classified by folder:   {by_folder:,}")
    print(f"   Uncertain (need AI):    {len(uncertain_files):,}\n")

    # 3. AI classification for uncertain files
    if not args.no_ai and uncertain_files:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            print("⚠️  ANTHROPIC_API_KEY not set — skipping AI analysis")
        else:
            import anthropic

            if args.limit > 0:
                uncertain_files = uncertain_files[:args.limit]
                print(f"🤖 AI classifying {len(uncertain_files):,} files (limited to {args.limit})...")
            else:
                print(f"🤖 AI classifying {len(uncertain_files):,} uncertain files...")

            # Estimate cost
            est_tokens = len(uncertain_files) * 600  # ~600 tokens per file avg
            est_cost = (est_tokens / 1_000_000) * 0.50  # haiku batch price
            print(f"   Estimated cost: ~${est_cost:.2f} (Haiku batch API)\n")

            client = anthropic.Anthropic(api_key=api_key)

            # Process in chunks of 100 (batch API limit per request)
            CHUNK_SIZE = 100
            ai_results_map = {}

            for chunk_start in range(0, len(uncertain_files), CHUNK_SIZE):
                chunk = uncertain_files[chunk_start:chunk_start + CHUNK_SIZE]
                chunk_num = chunk_start // CHUNK_SIZE + 1
                total_chunks = (len(uncertain_files) + CHUNK_SIZE - 1) // CHUNK_SIZE
                print(f"   Submitting batch {chunk_num}/{total_chunks} ({len(chunk)} files)...")

                # Build requests
                batch_requests = []
                file_index_map = {}  # custom_id -> filepath

                for i, filepath in enumerate(chunk):
                    cid = f"file-{chunk_start + i}"
                    file_index_map[cid] = filepath
                    ext = filepath.suffix.lower()

                    try:
                        if ext in IMAGE_EXTS:
                            try:
                                from PIL import Image
                                img_data, media_type = encode_image(filepath)
                                content = [
                                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_data}},
                                    {"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name)}
                                ]
                            except ImportError:
                                content = [{"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name)}]
                        elif ext in PDF_EXTS:
                            pdf_data = encode_pdf(filepath)
                            content = [
                                {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_data}},
                                {"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name)}
                            ]
                        else:
                            continue
                    except Exception as e:
                        content = [{"type": "text", "text": CLASSIFIER_PROMPT.format(filename=filepath.name) + f"\n(Error reading file: {e})"}]

                    from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
                    from anthropic.types.messages.batch_create_params import Request
                    batch_requests.append(Request(
                        custom_id=cid,
                        params=MessageCreateParamsNonStreaming(
                            model="claude-haiku-4-5",
                            max_tokens=200,
                            messages=[{"role": "user", "content": content}]
                        )
                    ))

                if not batch_requests:
                    continue

                # Submit batch
                batch = client.messages.batches.create(requests=batch_requests)
                print(f"   Batch ID: {batch.id} — waiting...")

                # Poll for completion
                while True:
                    batch = client.messages.batches.retrieve(batch.id)
                    if batch.processing_status == "ended":
                        break
                    print(f"   Status: {batch.request_counts.processing} processing, {batch.request_counts.succeeded} done...")
                    time.sleep(15)

                print(f"   ✓ Batch complete — {batch.request_counts.succeeded} succeeded, {batch.request_counts.errored} errors")

                # Collect results
                for result in client.messages.batches.results(batch.id):
                    if result.result.type == "succeeded":
                        msg = result.result.message
                        text = next((b.text for b in msg.content if b.type == "text"), "")
                        try:
                            parsed = json.loads(text.strip())
                            ai_results_map[result.custom_id] = parsed
                        except json.JSONDecodeError:
                            ai_results_map[result.custom_id] = {
                                "category": "reference", "project_name": "",
                                "confidence": 0.5, "reason": "AI parse error"
                            }

            # Update results with AI classifications
            for result in results:
                if result["category"] == "unknown":
                    filepath_str = result["filepath"]
                    # Find matching AI result
                    for cid, ai_result in ai_results_map.items():
                        file_idx = int(cid.replace("file-", ""))
                        if file_idx < len(uncertain_files) and str(uncertain_files[file_idx]) == filepath_str:
                            result["category"] = ai_result.get("category", "reference")
                            result["project_name"] = ai_result.get("project_name", "")
                            result["confidence"] = ai_result.get("confidence", 0.5)
                            result["reason"] = ai_result.get("reason", "")
                            result["source"] = "ai"
                            result["suggested_folder"] = str(suggest_folder(
                                result["category"], result["project_name"],
                                result["ext"], folder
                            ))
                            break

    # 4. Output CSV
    csv_path = Path(str(output_base) + ".csv")
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["filename", "category", "project_name", "confidence", "source", "reason", "suggested_folder", "filepath"], extrasaction="ignore")
        writer.writeheader()
        for r in sorted(results, key=lambda x: (x["category"], x.get("project_name", ""))):
            writer.writerow(r)
    print(f"\n📊 CSV report: {csv_path}")

    # 5. Output HTML
    html_path = Path(str(output_base) + ".html")
    write_html_report(results, html_path)
    print(f"🌐 HTML report: {html_path}")

    # 6. Summary
    project_count = sum(1 for r in results if r["category"] == "project")
    ref_count = sum(1 for r in results if r["category"] == "reference")
    unknown_count = sum(1 for r in results if r["category"] == "unknown")

    print(f"\n📈 SUMMARY")
    print(f"   Total files:   {len(results):,}")
    print(f"   ✅ Project:    {project_count:,}")
    print(f"   📚 Reference:  {ref_count:,}")
    print(f"   ❓ Unknown:    {unknown_count:,}")

    # Show project breakdown
    project_breakdown = {}
    for r in results:
        if r["category"] == "project" and r["project_name"]:
            project_breakdown[r["project_name"]] = project_breakdown.get(r["project_name"], 0) + 1
    if project_breakdown:
        print(f"\n🎬 PROJECT BREAKDOWN")
        for proj, count in sorted(project_breakdown.items(), key=lambda x: -x[1])[:15]:
            print(f"   {proj}: {count}")

    # 7. Move files if requested
    if args.move:
        print(f"\n📦 Moving files...")
        moved = 0
        errors = 0
        for r in results:
            if r["category"] == "unknown":
                continue
            src = Path(r["filepath"])
            dst_dir = Path(r["suggested_folder"])
            dst = dst_dir / src.name
            try:
                dst_dir.mkdir(parents=True, exist_ok=True)
                if dst.exists():
                    dst = dst_dir / f"{src.stem}__{int(time.time())}{src.suffix}"
                shutil.move(str(src), str(dst))
                moved += 1
            except Exception as e:
                print(f"  ⚠ {src.name}: {e}")
                errors += 1
        print(f"   Moved: {moved:,} files ({errors} errors)")
    else:
        print(f"\n💡 Dry run — use --move to actually move files")

    # Open HTML report
    os.system(f'open "{html_path}"')
    print(f"\n✅ Done.\n")


if __name__ == "__main__":
    main()
