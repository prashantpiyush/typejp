"""
Helper script to get romaji to kana conversion

"""

import json
import requests
from bs4 import BeautifulSoup
from lxml import html

url = 'https://en.wikipedia.org/wiki/Romanization_of_Japanese'

wiki_text = requests.get(url).text
soup = BeautifulSoup(wiki_text, features='lxml')
table = soup.findAll('table', class_='wikitable')

conv_tbl = table[1]
# print(conv_tbl)

conv = {}

trs = conv_tbl.tbody.find_all('tr')

for tr in trs:
    tds = tr.find_all('td')
    if len(tds) == 0:
        continue
    kana = tds[0].get_text().strip()
    for idx in range(2, len(tds)):
        romaji = tds[idx].get_text().strip()
        if romaji.startswith("n-n"): #romaji == 'n-n'
            conv['nn'] = kana
            conv['n '] = kana
            continue
        # prevent getting overriden by obsolete chars like we wi
        if romaji in conv:
            continue
        conv[romaji] = kana

# add small tsu
conv['ltsu'] = '\u3063'

four_letters = {'shya': 'sha', 'shyu': 'shu', 'shyo': 'sho',
                'chya': 'cha', 'chyu': 'chu', 'chyo': 'cho'}
for key, val in four_letters.items():
    if val not in conv:
        print(f'{val} conv key not found.')
        continue
    conv[key] = conv[val]

extras = {
    'va': '\u3094\u3041',
    'vi': '\u3094\u3043',
    'vu': '\u3094',
    've': '\u3094\u3047',
    'vo': '\u3094\u3049',
    'vya': '\u3094\u3083',
    'vyu': '\u3094\u3085',
    'vyo': '\u3094\u3087',
    'fya': '\u3075\u3083',
    'fyu': '\u3075\u3085',
    'fyo': '\u3075\u3087',
    'fa': '\u3075\u3041',
    'fi': '\u3075\u3043',
    'fe': '\u3075\u3047',
    'fo': '\u3075\u3049',
    'wu': '\u3046',
    'wi': '\u3046\u3043',
    'we': '\u3046\u3047',
    'yi': '\u3044',
    'ye': '\u3044\u3047'
}
for key, val in extras.items():
    conv[key] = val


with open('conversion.json', 'w') as f:
    f.write(json.dumps(conv, indent=4))
