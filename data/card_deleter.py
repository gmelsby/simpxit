import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore
from pathlib import Path

load_dotenv()

# connect to supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def main():
    if len(sys.argv) < 2:
        print('Please specify a source file as a command line argument', file=sys.stderr)
        return
    
    with open(sys.argv[1], 'r') as files:
        filename = files.readline().strip()
        while filename:
            print(filename)
            '''
            data, count = (supabase.table('card')
                .delete()
                .eq('locator', filename)
                .execute())
            '''

            filename = files.readline().strip()

if __name__ == '__main__':
    main()
