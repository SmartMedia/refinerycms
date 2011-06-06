## https://gist.github.com/12499d2cf62753f0c339

When /^(?:|I )select "([^\"]*)" as the "([^\"]*)" date$/ do |date, date_label|
  select_date(date, :from => date_label)
end


When /^(?:|I )select "([^\"]*)" as the "([^\"]*)" datetime$/ do |datetime, datetime_label|
  select_datetime(datetime, :from => datetime_label)
end

DATE_TIME_SUFFIXES = {
  :year   => '1i',
  :month  => '2i',
  :day    => '3i',
  :hour   => '4i',
  :minute => '5i'
}

def select_date(date_to_select, options ={})
  date = date_to_select.is_a?(Date) || date_to_select.is_a?(Time) ?
            date_to_select : Date.parse(date_to_select)

  id_prefix = options[:from]

  select date.year.to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:year]}"
  select date.strftime('%B'), :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:month]}"
  select date.day.to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:day]}"
end

def select_datetime(date_to_select, options = {})
  date = date_to_select.is_a?(Date) || date_to_select.is_a?(Time) ?
            date_to_select : Date.parse(date_to_select)

  id_prefix = options[:from]

  select date.year.to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:year]}"
  select date.strftime('%B'), :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:month]}"
  select date.day.to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:day]}"
  select date.strftime('%H').to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:hour]}"
  select date.strftime('%M').to_s, :from => "#{id_prefix}_#{DATE_TIME_SUFFIXES[:minute]}"
end

