import { NextResponse } from 'next/server';
import { PatientResponseHandler } from '../../utils/patientResponseHandler';

const responseHandler = new PatientResponseHandler();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    await responseHandler.saveResponse({
      sessionId: responseHandler.getSessionId(),
      question: data.question,
      answer: data.answer,
      questionType: data.questionType,
      options: data.options,
      selectedOption: data.selectedOption
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-response route:', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}