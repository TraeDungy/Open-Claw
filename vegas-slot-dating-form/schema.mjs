/* POLY SWIPE — canonical applicant-intake CSV schema.
 *
 * Column order is the contract: it must match the master CSV header exactly
 * so files import cleanly into Sheets/Airtable. 52 submission-level columns
 * + 32 columns per person block (p1_–p4_) = 180 columns total.
 *
 * Privacy model (two-stage intake):
 * - dob, legal_name, sex, sti_status, health notes, emergency contacts are
 *   collected later via a secured callback workflow, not the public form.
 *   The columns exist so the master CSV is also the booking sheet.
 * - sti_status_optional defaults to not_disclosed.
 * - producer_* and mod_safety_flag are internal-only columns, never
 *   applicant-facing.
 */

export const SUBMISSION_COLUMNS = [
  'submission_id', 'application_ts',
  'event_name', 'event_city', 'event_state', 'event_venue', 'event_date', 'season_label',
  'submission_type', 'group_size', 'current_config', 'current_config_notes',
  'searching_for', 'preferred_stage_role', 'relationship_map', 'primary_contact_slot',
  'home_city', 'home_state',
  'availability_from', 'availability_to', 'blackout_dates',
  'weekday_evening_ok', 'weekend_ok', 'short_notice_ok',
  'travel_radius_mi', 'can_self_transport', 'transport_needs', 'accessibility_needs',
  'group_socials', 'group_bio', 'group_dynamic_summary',
  'consent_code_of_conduct', 'consent_house_rules', 'consent_data_privacy',
  'marketing_opt_in', 'referral_source', 'referral_detail', 'compensation_expectation',
  'group_photo_file', 'group_photo_file_2', 'group_video_file',
  'producer_status',
  'producer_score_charisma', 'producer_score_camera', 'producer_score_story',
  'producer_score_compatibility', 'producer_score_reliability', 'producer_score_safety',
  'producer_score_diversity', 'producer_score_total',
  'producer_notes', 'mod_safety_flag',
];

export const PERSON_COLUMNS = [
  'display_name', 'legal_name', 'email', 'phone', 'dob', 'age_band',
  'relationship_status', 'sex', 'gender_identity', 'pronouns', 'pronoun_display',
  'poly_style', 'role_in_group', 'social_handles', 'short_bio',
  'green_flags', 'red_flags', 'dealbreakers',
  'favorite_food', 'best_qualities',
  'longest_relationship_months', 'relationship_goals',
  'boundaries_hard_limits', 'health_safety_notes', 'sti_status_optional',
  'emerg_name', 'emerg_phone', 'emerg_relation',
  'photo_file',
  'consent_live_broadcast', 'consent_media_release', 'consent_voluntary',
];

export const MAX_PERSONS = 4;

export const HEADER = [
  ...SUBMISSION_COLUMNS,
  ...Array.from({ length: MAX_PERSONS }, (_, i) =>
    PERSON_COLUMNS.map((c) => `p${i + 1}_${c}`)).flat(),
];

/* ---- controlled vocabularies (validation lists) ---- */
export const VOCAB = {
  submission_type: ['single', 'group'],
  current_config: ['solo', 'couple', 'throuple', 'quad', 'other'],
  searching_for: ['single_male', 'single_female', 'single_nonbinary', 'couple', 'throuple', 'quad', 'open_to_any'],
  preferred_stage_role: ['featured', 'backup', 'audience_only'],
  primary_contact_slot: ['p1', 'p2', 'p3', 'p4'],
  yes_no: ['yes', 'no'],
  age_band: ['18_20', '21_24', '25_29', '30_34', '35_39', '40_44', '45_49', '50_54', '55_plus'],
  relationship_status: ['single', 'dating', 'partnered', 'married', 'its_complicated'],
  sex: ['female', 'male', 'intersex', 'prefer_not_to_say'],
  pronoun_display: ['show_on_screen', 'internal_only'],
  poly_style: ['solo_poly', 'polyamorous', 'ethical_non_monogamy', 'open_relationship',
    'relationship_anarchy', 'swinger', 'monogamish', 'poly_curious', 'figuring_it_out', 'monogamous'],
  role_in_group: ['primary_applicant', 'partner', 'member', 'single_friend'],
  relationship_goals: ['casual_connections', 'dating_exploration', 'long_term_partner',
    'expand_existing_relationship', 'community', 'new_friendships'],
  sti_status_optional: ['not_disclosed', 'prefer_not_to_say', 'discuss_privately_if_selected'],
  referral_source: ['instagram', 'tiktok', 'facebook', 'website', 'friend', 'producer_outreach', 'other'],
  compensation_expectation: ['none', 'travel_only', 'discuss_if_selected'],
  producer_status: ['new', 'screening', 'callback', 'hold', 'booked', 'declined', 'archived'],
  mod_safety_flag: ['none', 'review', 'escalate', 'blocked'],
};

/* ---- CSV serialization ---- */
export function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsvLine(rowObj) {
  return HEADER.map((col) => csvEscape(rowObj[col])).join(',');
}

export function headerLine() {
  return HEADER.join(',');
}

// sanity check: the schema contract is 180 columns
if (HEADER.length !== SUBMISSION_COLUMNS.length + MAX_PERSONS * PERSON_COLUMNS.length || HEADER.length !== 180) {
  throw new Error(`schema drift: expected 180 columns, got ${HEADER.length}`);
}
