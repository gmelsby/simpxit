import os
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore
import requests #type: ignore
from PIL import Image #type: ignore
from pathlib import Path
from time import sleep

load_dotenv()

# connect to supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def get_random_card():
    r = requests.get(f'https://frinkiac.com/api/random')
    results = r.json()
    print(results)

    if r.status_code != 200:
        print(f'received status code {r.status_code}')
        return None

    card_info = {
    'key': results['Episode']['Key'],
    'episode_number': results['Episode']['EpisodeNumber'],
    'season_number': results['Episode']['Season'],
    'title': results['Episode']['Title'],
    'director': results['Episode']['Director'],
    'writer': results['Episode']['Writer'],
    'original_air_date': results['Episode']['OriginalAirDate'],
    'timestamp': results['Frame']['Timestamp'],
    'subtitles': [sub['Content'] for sub in results['Subtitles']]
    }

    print(card_info)
    return card_info

def download_image(key, timestamp) -> str:
    """
    Downloads the image from frinkiac and saves the image as a webp. Returns the filename of the saved image
    """ 
    # saves jpg image in temp folder
    res = requests.get(f'https://frinkiac.com/img/{key}/{timestamp}.jpg')
    filename = f'{key}_{timestamp}'
    temp_dir = 'images_temp'
    with open(f'{temp_dir}/{filename}.jpg', 'wb') as file:
        file.write(res.content)

    # converts jpg image to webp
    with Image.open(f'{temp_dir}/{filename}.jpg') as image:
        image = image.convert()
        image.save(f'images/{filename}.webp', 'webp')
    
    # cleans up old file
    Path.unlink(f'{temp_dir}/{filename}.jpg')



    return f'{filename}.webp'


def add_card_to_database(card_info) -> bool:
    """
    Adds the card to the card table and creates a corresponding episode in episode table if needed
    """

    # gets episode id if episode exists in database
    episode_data, _ = (supabase.table('episode')
                       .select('id')
                       .eq('key', card_info['key'])
                       .execute())

    # if episode does not exist, add it to the database
    if len(episode_data[1]):
        print(f'Episode {card_info['key']} already exists')

    else:
        print(f'Creating episode {card_info['key']}')
        episode_data, _ = (supabase.table('episode')
            .insert({
                'key': card_info['key'],
                'episode_number': card_info['episode_number'],
                'season_number': card_info['season_number'],
                'title': card_info['title'],
                'director': card_info['director'],
                'writer': card_info['writer'],
                'airdate': card_info['original_air_date'],
            })
            .execute())

    episode_id = episode_data[1][0]['id']


    # checks if card with matching episode and timestamp exists in database
    card_data, _ = (supabase.table('card')
                        .select('id')
                        .eq('episode_id', episode_id)
                        .eq('timestamp', card_info['timestamp'])
                        .execute())


    # exits early if card with same episode and timestamp exists
    if len(card_data[1]):
        print('Card already exists!')
        return False

    # downloads image
    card_info['filename'] = download_image(card_info['key'], card_info['timestamp'])
    print(f'Downloaded image {card_info['filename']}')

    card_data, _ = (supabase.table('card')
                    .insert({
                        'timestamp': card_info['timestamp'],
                        'subtitles': card_info['subtitles'],
                        'locator': f'{card_info['filename']}',
                        'frinkiac_link': f'https://frinkiac.com/caption/{card_info['key']}/{card_info['timestamp']}',
                        'episode_id': episode_id,
                    })
                    .execute())
    print('Put new card in database')
    return True


def main():
    consecutive_failure_count = 0
    while True:
        new_card = get_random_card()

        # handle issue with fetching
        if new_card is None:
            consecutive_failure_count += 1

            # if we have repeated failures, exit
            if consecutive_failure_count >= 5:
                break

            # sleep and try again
            sleep(30)
            continue

        # reset failure count if execution makes it this far
        consecutive_failure_count = 0

        # filter out movie cards and season 13+ cards (larger image size)
        if new_card['season_number'] < 1 or new_card['season_number'] >= 13:
            sleep(5)
            print('Card season out of range, skipping...')
            continue

        add_card_to_database(new_card)

        bytes_used = (sum(f.stat().st_size for f in Path('images').glob('**/*') if f.is_file()))
        print(f'{bytes_used / (10 ** 6)} Mb used')
        if bytes_used > 8 * 10 ** 8:
            break

        sleep(5)

if __name__ == "__main__":
    main()
