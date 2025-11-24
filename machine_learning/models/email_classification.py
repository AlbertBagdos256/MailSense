import openai
from dotenv import load_dotenv
import os
import json

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

def classify_message(message: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4.1-mini", 
        messages=[
            {"role": "system", "content": "You are a precise classification assistant."},
            {"role": "user", "content": f"""
                Classify the following message into ONE of these categories:
                - Work
                - Personal
                - Reply Needed
                - Education
                - Job Applications

                Rules:
                - Output ONLY valid JSON in the format: {{"message": "<original message>", "category": "<one category>"}}
                - Do not include explanations or extra text.
                - If the message is about professional tasks, meetings, or office work → classify as Work.
                - If the message is casual, social, or about family/friends → classify as Personal.
                - If the message explicitly requires a response or action → classify as Reply Needed.
                - If the message is about studying, courses, or academic topics → classify as Education.
                - If the message is about resumes, interviews, or applying for jobs → classify as Job Applications.

                Message: "{message}"
            """}
        ],
        temperature=0,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    test_message = """ Dear <Name>, 
Ready to take the next step in shaping your leadership career? CUNY invites you to join our Master's and Doctoral Programs in Leadership Information Session.

This is your chance to connect directly with program directors and faculty from our colleges. The experts who are training the next generation of academic, organizational, and community leaders. 	 
Why Attend:
•	Tailored Degree Paths: Explore our Master's and EdD programs in Leadership, in area's including: Higher Education Administration, Organizational Leadership, Instructional Leadership, and Community-Based Leadership. 
•	Future-Proof Your Career: Understand how CUNY's distinctive, applied curricula featuring real-world application equips you to tackle complex challenges and achieve unmatched career mobility. 
•	Gain a Competitive Edge: Get clear, direct guidance on the application process, admissions requirements, and the specific qualities competitive leadership programs seek in successful candidates. """

    result = classify_message(test_message)
    print(json.dumps(result, indent=4))