Then /^I should see Wymeditor$/ do
  if page.respond_to? :should
    page.should have_selector('textarea.wymeditor')
  else
    assert page.have_selector('textarea.wymeditor')
  end
end
