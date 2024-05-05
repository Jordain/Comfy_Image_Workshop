def update_db(url):
    
    db.session.commit()
    db.session.close()