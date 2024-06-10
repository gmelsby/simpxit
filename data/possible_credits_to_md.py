import sys

folder_name = './images'

def main():
    for line in sys.stdin:
        file_name = line.strip()
        if not file_name:
            break
        print(f'![{file_name}]({folder_name}/{file_name})\n*{file_name}*\n')

if __name__ == '__main__':
    main()
