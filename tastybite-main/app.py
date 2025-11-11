from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/userlogin')
def user_login():
    return render_template('userlogin.html')

@app.route('/catererlogin')
def caterer_login():
    return render_template('catererlogin.html')

@app.route('/create')
def create_account():
    return render_template('create.html')

@app.route('/userdetail')
def user_detail():
    return render_template('user_detail.html')

@app.route('/catererdetail')
def caterer_detail():
    return render_template('caterer_detail.html')

@app.route('/userdashboard')
def user_dashboard():
    return render_template('user_dashboard.html')

@app.route('/mybooking')
def my_booking():
    return render_template('my_booking.html')

if __name__ == '__main__':
    app.run(debug=True)
