const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    // Your Firebase service account credentials
    const serviceAccount = {
        "type": "service_account",
        "project_id": "mitti-arts-11",
        "private_key_id": "b75fdddb7373f432cd88bc52d0329e9226205d78",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd4dlg6uL9ZOm\n2BXuCiNIrneioVaUgZQXWqp/7W5gqpf3gEbtfr1iGFZVkav3oa1cZZufzjMM9zhY\n/LOdEuiSQ/iKkPZymnXEy+tS21OKnIMOhExfJtIBjKW1GbJCCIb6nfvRNp2Sdqnn\n0e44o/FKeW8/57RrSSCmehNNpZ/fystoEHOrVhfj+DBNnC1UOgWYui6w5rjh0kiB\neyJ8jCdbq/f3uQzAGLn8+d4AFn2PPXXlHoU3pOcl4vvs8/5+4lryRbSo525eHGWJ\nOQrO97eXw2748CrU4SznTAG0EvAJqj3Tu7JZa4Yo975Nu8068LZCu+6QivKbQ5f2\nlFajfPmXAgMBAAECggEAHgZphzNgednoT+UntSqTfSLWyAJcisg9xz1aqgX/jhfn\nolUtTRYOtPc4PKdWg+TzP/9mvs+gnItsvjXEn7xNTWiMX17RAOpWQ+y4p6ypiRTD\nTIgSDmZd+FpNkx14EiyXBqByQVavgYPorEW8QQdTbfHbF1gl85dWpew3+Wd9jlU2\nD6sZn00mAJiKvxD49PSEbGy5oqmPfKU+whxQ9vY6SmHEMqddjlmGwX2UM9z8C3oq\neKTBfOS6MUZuCvduJDtWmOse8zAEclo0oXY44ghLaSf31vgv7r8+fnLV/Gimx/TX\nW308fLo1Kml7Bt7N310ruUklFOLuGcH+8v85V1Fd0QKBgQD4vwaleL3i6kJgj0YB\nIadnBhwbDihqB864Fslq94y66HLIWKKL+F5SlbuNIpkliQqnkMHcrJ5bcfH0U8Cb\nLZkfv8CacGcLcQKdQ7YEzmfLztoJc1pj4rTd8fqG6fjBs9eE1GS4vb/91JOe+YK/\nt0MQm+DWGDruveXZPROhwjvlhwKBgQDdwA/WkWBYW9HyHxUDHnmFODmUx/pj0EfI\nN9CB9QHa9lOInEhvjHPjF8rDeYJWCPe7Acm9gbLwR+Asdo3irN3KUf5UVf3oq1kU\nF711wfZZxM72djV6DoWx56vtCj/EKXWe0g1EJUIqBwiLWoG34vws8sFof+/WqIJ1\n9+kdiQhPcQKBgBv96zKNztiNQiD5nogcEGmQj3Mf+b5M2J9wuQPXjbeu1tPi3Y/g\nyESE4xEz1oYZ0OAgcyBxMHTb8r1q+167F+MxwevfQElSU1f9Oat6ysVtpq2vlHlv\nFqlvRKEQDVVG9rbU6+y6NbPLyzz1mRgX+G0TDY8qNN+O8SGsNNxcLj9bAoGASNXK\n3flGIf+Wx+Y5qpqZ444CK8I7lglVaogarnThNSBvc5GRoUIK1m58JRSGIOg1JnGB\n6ALv2Uhic3hFRkztVIT1+pF8Iq4VRio+Cq240ud36zAMhJi8hSDJMcSKCU5s2cu4\nm8d5IgDJZ6xEqzedCM57hG1xQ5p5r3HMWe0mk6ECgYEA5vaDWXIdh9uTmvbDSiXw\n9oPMohMjBnADNo1EUxI7d0Q5a5v/MKok8gY7CyTwuWQPbtTT8WBfpOAlsXLPU7dB\nIntbINnnS6iwEh7FCvIYvU8S6raNIINiGG+etC1f0GUCppnyCis2PsdHueLiSE5o\ncsvRiyMBwZdhHZoJO/01oy4=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-fbsvc@mitti-arts-11.iam.gserviceaccount.com",
        "client_id": "103109421333027835056",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mitti-arts-11.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'mitti-arts-11'
    });
}

// Get Firestore instance
const db = getFirestore();

module.exports = {
    admin,
    db
};