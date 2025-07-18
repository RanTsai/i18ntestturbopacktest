export type QuestionType = 'text' | 'radio' | 'checkbox' | 'rating' | 'number' | 'checkbox' | 'textarea' 

export interface Option {
  id: string
  label: string
}

export interface ReviewQuestion {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: Option[] // for radio / checkbox
  maxRating?: number // for star
  placeholder?: string // for input/number
  min?: number        // for number
  max?: number        // for number
}
