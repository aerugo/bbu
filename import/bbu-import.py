import logging
import json
import os
from neo4j import GraphDatabase
import discourse2ssna as ssna

def main():

    mylogs = logging.getLogger(__name__)
    mylogs.setLevel(logging.DEBUG)

    file = logging.FileHandler("bbu-import.log")
    file.setLevel(logging.INFO)
    fileformat = logging.Formatter("%(asctime)s:%(levelname)s: %(message)s",datefmt="%H:%M:%S")
    file.setFormatter(fileformat)

    stream = logging.StreamHandler()
    stream.setLevel(logging.DEBUG)
    streamformat = logging.Formatter("%(asctime)s: %(message)s")
    stream.setFormatter(streamformat)

    mylogs.addHandler(file)
    mylogs.addHandler(stream)

    with open("./config.json") as json_config:
        config = json.load(json_config)

    uri = config['neo4j_uri']
    driver = GraphDatabase.driver(uri, auth=(config['neo4j_user'], config['neo4j_password']))
    data_path = os.path.abspath('./db/')

    databases = config['databases']

    # Load data from Discourse psql databases and dump to json files
    # Data is loaded from JSON files because Neo4j APOC functions are optimized for this.
    dbs = databases[:]
    if config['reload_from_database']:
        ssna.reload_data(dbs)
    data = ssna.load_data(dbs)

    # Build Neo4j database

    # TODO: Refactor 'for platform in data.values()' loop into function
    # TODO: Refactor create index into function

    mylogs.info(' ')
    mylogs.info('Building Neo4j database...')
    mylogs.info(' ')

    # Calls to update graph 
    ssna.graph_clear(driver)
    ssna.graph_create_platform(driver, data)
    ssna.graph_create_groups(driver, data)
    ssna.graph_create_users(driver, data)
    ssna.graph_create_tags(driver, data)
    ssna.graph_create_categories(driver, data)
    ssna.graph_create_topics(driver, data)
    ssna.graph_create_posts(driver, data)
    ssna.graph_create_replies(driver, data)
    ssna.graph_create_quotes(driver, data)
    ssna.graph_create_interactions()
    ssna.graph_create_likes(driver, data)
    ssna.graph_create_languages(driver, data)
    ssna.graph_create_codes(driver, data)
    ssna.graph_create_code_ancestry(driver, data)
    ssna.graph_create_code_names(driver, data)
    ssna.graph_create_annotations(driver, data)
    ssna.graph_create_corpus(driver)
    ssna.graph_create_code_cooccurrences(driver)
    ssna.graph_create_code_use(driver)

if __name__ == '__main__':
    main()
