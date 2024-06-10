import sys

folder_name = '.images'

def main():
    with open(sys.stdin, 'r') as possible_credits:
        file_name = possible_credits.readline()
        while file_name:
            print(f'![{file_name}]({folder_name}/{file_name})')
            file_name = possible_credits.readline()

if __name__ == '__main__':
    main()
